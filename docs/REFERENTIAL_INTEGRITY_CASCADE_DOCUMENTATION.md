# Complete Database Cascade Tree Documentation
## Uribarri.online Referential Integrity

> **Last Updated:** 2025-01-20  
> **Status:** All Priority 1 cascades implemented ✅  
> **Approach:** Manual cascade deletes (no Sequelize associations or SQL foreign keys)

---

## Table of Contents
1. [Database Schema Overview](#database-schema-overview)
2. [Complete Cascade Trees](#complete-cascade-trees)
3. [Entity-by-Entity Cascade Details](#entity-by-entity-cascade-details)
4. [Filesystem Cleanup](#filesystem-cleanup)
5. [Order Protection Logic](#order-protection-logic)
6. [Implementation Status](#implementation-status)

---

## Database Schema Overview

### Primary Entities (Independent)
- **user** - Base entity (sellers, buyers, managers, contributors)
- **shop_type** - Shop category types
- **shop_subtype** - Shop subcategories
- **product_category** - Product categories
- **product_subcategory** - Product subcategories

### Secondary Entities (Depend on User)
- **shop** - Stores owned by users
- **organization** - Associations/organizations managed by users
- **publication** - Community posts (can be tied to user or organization)

### Tertiary Entities (Depend on Shop)
- **product** - Products sold in shops
- **package** - Product bundles (references 1-5 products)

### Transactional Entities
- **order** - Customer orders (references user, shop)
- **order_product** - Line items in orders (references product)
- **order_package** - Package items in orders (references package)

### Relational Entities
- **participant** - Users in organizations
- **participant_request** - Pending join requests
- **participant_publication** - Publication participants (social events)
- **calification_product** - Product ratings
- **calification_shop** - Shop ratings
- **shop_valoration** - Shop reviews

---

## Complete Cascade Trees

### 🌳 USER Cascade Tree (Root Entity)

```
USER (id_user)
│
├─── Active Order Check ⚠️
│    └─── IF has orders with status IN ['pending','confirmed','preparing','ready']
│         └─── PREVENT deletion (return error)
│
├─── SHOP (id_user → USER)
│    │
│    ├─── PACKAGE (id_shop → SHOP)
│    │    │
│    │    ├─── Delete package.image_package from filesystem
│    │    └─── Delete PACKAGE record from database
│    │
│    ├─── PRODUCT (id_shop → SHOP)
│    │    │
│    │    ├─── Check if PRODUCT is in any PACKAGE
│    │    │    └─── IF yes → Delete those PACKAGES first (with images)
│    │    │
│    │    ├─── Delete product.image_product from filesystem
│    │    └─── Delete PRODUCT record from database
│    │
│    ├─── Delete shop folder: assets/images/shops/{shop_name}/
│    └─── Delete SHOP record from database
│
├─── ORGANIZATION (id_user → USER)
│    │
│    ├─── Check participant count
│    │    └─── IF > 1 participant → PREVENT deletion (return error)
│    │
│    ├─── PARTICIPANT (id_org → ORGANIZATION)
│    │    └─── Delete all PARTICIPANT records
│    │
│    ├─── PUBLICATION (id_org → ORGANIZATION)
│    │    │
│    │    ├─── Delete publication.image_pub from filesystem
│    │    └─── Delete PUBLICATION record from database
│    │
│    ├─── Delete organization folder: assets/images/organizations/{org_name}/
│    └─── Delete ORGANIZATION record from database
│
├─── PUBLICATION (id_user_pub → USER, id_org = NULL)
│    │   (Standalone publications not tied to organizations)
│    │
│    ├─── Delete publication.image_pub from filesystem
│    └─── Delete PUBLICATION record from database
│
├─── Delete user.image_user from filesystem
├─── Delete user folder: assets/images/users/{user_name}/
└─── Delete USER record from database
```

**Implementation:** ✅ Complete  
**File:** `back-end/controllers/user/user_controller.js:890-1028`  
**Protection:** Prevents deletion if active orders exist

---

### 🏪 SHOP Cascade Tree

```
SHOP (id_shop)
│
├─── PACKAGE (id_shop → SHOP)
│    │
│    ├─── Delete package.image_package from filesystem
│    │    └─── Path: assets/images/shops/{shop_name}/packages/{image}
│    │
│    └─── Delete PACKAGE record from database
│
├─── PRODUCT (id_shop → SHOP)
│    │
│    ├─── Check if PRODUCT is in any PACKAGE
│    │    └─── IF yes → Those packages already deleted above
│    │
│    ├─── Delete product.image_product from filesystem
│    │    └─── Path: assets/images/shops/{shop_name}/products/{product_name}/{image}
│    │
│    └─── Delete PRODUCT record from database
│
├─── Delete shop folder from filesystem
│    └─── Path: assets/images/shops/{shop_name}/
│         ├─── /cover_image/
│         ├─── /profile_image/
│         ├─── /products/
│         └─── /packages/
│
└─── Delete SHOP record from database
```

**Implementation:** ✅ Complete  
**File:** `back-end/controllers/shop/shop_controller.js:552-648`  
**Functions:**
- `removeById()` - Prevents deletion if shop has products
- `removeByIdWithProducts()` - Full cascade delete

**Protection:** ⚠️ Does NOT check for orders yet (Priority 2)

---

### 📦 PRODUCT Cascade Tree

```
PRODUCT (id_product)
│
├─── Check if PRODUCT is in any PACKAGE
│    │   Search for id_product in:
│    │   - package.id_product1
│    │   - package.id_product2
│    │   - package.id_product3
│    │   - package.id_product4
│    │   - package.id_product5
│    │
│    └─── IF found in any packages:
│         │
│         ├─── FOR EACH package containing this product:
│         │    │
│         │    ├─── Delete package.image_package from filesystem
│         │    └─── Delete PACKAGE record from database
│         │
│         └─── Log: "Producto está en X paquete(s). Eliminando paquetes..."
│
├─── Delete product.image_product from filesystem
│    └─── Also deletes the product folder if empty
│
└─── Delete PRODUCT record from database
```

**Implementation:** ✅ Complete  
**File:** `back-end/controllers/product/product_controller.js:500-566`  

**Protection:** ⚠️ Does NOT check for orders yet (Priority 2)

---

### 🎁 PACKAGE Cascade Tree

```
PACKAGE (id_package)
│
├─── Delete package.image_package from filesystem
│    └─── Path: assets/images/shops/{shop_name}/packages/{image}
│
└─── Delete PACKAGE record from database
```

**Implementation:** ✅ Complete  
**File:** `back-end/controllers/package/package_controller.js:395-439`

**Protection:** ⚠️ Does NOT check for orders yet (Priority 2)

**Note:** Packages do NOT cascade to products (products are independent)

---

### 🏢 ORGANIZATION Cascade Tree

```
ORGANIZATION (id_organization)
│
├─── Check participant count
│    └─── IF count > 1 → PREVENT deletion (return error)
│         "No se puede eliminar la asociación porque tiene X participante(s)"
│
├─── PARTICIPANT (id_org → ORGANIZATION)
│    └─── Delete all PARTICIPANT records
│         (Within transaction)
│
├─── PUBLICATION (id_org → ORGANIZATION)
│    │
│    ├─── FOR EACH publication:
│    │    │
│    │    ├─── Delete publication.image_pub from filesystem
│    │    │    └─── Path: assets/images/organizations/{org_name}/publications/{image}
│    │    │
│    │    └─── Delete PUBLICATION record from database
│    │
│    └─── Log: "X publicación(es) eliminadas de la asociación"
│
├─── Delete organization folder from filesystem
│    └─── Path: assets/images/organizations/{org_name}/
│         ├─── /profile_image/
│         └─── /publications/
│
└─── Delete ORGANIZATION record from database
```

**Implementation:** ✅ Complete  
**File:** `back-end/controllers/organization/organization_controller.js:421-519`

**Protection:**
- ✅ Prevents deletion if organization has > 1 participant
- Uses transactions for atomicity

---

### 📰 PUBLICATION Cascade Tree

```
PUBLICATION (id_publication)
│
├─── Delete publication.image_pub from filesystem
│    │
│    └─── IF id_org exists:
│         └─── Path: assets/images/organizations/{org_name}/publications/{image}
│    
│    └─── ELSE (standalone):
│         └─── Path: assets/images/users/{user_name}/publications/{image}
│
└─── Delete PUBLICATION record from database
```

**Implementation:** ✅ Complete  
**File:** `back-end/controllers/publication/publication_controller.js:421-506`

**Note:** Publications can be tied to organizations OR standalone user posts

---

### 🛒 ORDER Cascade Tree

```
ORDER (id_order)
│
├─── ORDER_PRODUCT (references order)
│    └─── Delete ORDER_PRODUCT records
│         (Line items referencing products)
│
├─── ORDER_PACKAGE (references order)
│    └─── Delete ORDER_PACKAGE records
│         (Line items referencing packages)
│
└─── Delete ORDER record from database
```

**Implementation:** ❌ NOT IMPLEMENTED YET (Priority 2)  
**File:** No deletion function exists

**Note:** Orders should likely use soft deletes (mark as deleted) rather than hard deletes to preserve historical data

---

## Entity-by-Entity Cascade Details

### 1. USER → SHOP → PRODUCT → PACKAGE

**Delete Order:**
1. Check active orders (prevent if exists)
2. Delete packages (for each shop)
3. Delete products (for each shop)
4. Delete shops
5. Delete organizations
6. Delete publications (org + standalone)
7. Delete user images/folders
8. Delete user

**Filesystem Cleanup:**
```
assets/images/users/{user_name}/
├── profile_image/
└── publications/

assets/images/shops/{shop_name}/
├── cover_image/
├── profile_image/
├── products/{product_name}/
│   └── {image_files}
└── packages/
    └── {image_files}

assets/images/organizations/{org_name}/
├── profile_image/
└── publications/
    └── {image_files}
```

---

### 2. SHOP → PRODUCT + PACKAGE

**Delete Order:**
1. Find all packages for shop
2. Delete package images
3. Delete package records
4. Find all products for shop
5. Delete product images
6. Delete product records
7. Delete shop folder
8. Delete shop record

**Key Logic:**
- Products are deleted AFTER packages (to avoid orphaning)
- Each product checks if it's in a package (double safety)
- Shop folder deletion is recursive

---

### 3. PRODUCT → CHECK PACKAGES

**Delete Order:**
1. Query all packages where product appears in id_product1-5
2. For each package found:
   - Delete package image
   - Delete package record
3. Delete product image
4. Delete product record

**Query Logic:**
```javascript
const packagesWithProduct = await package_model.findAll({
    where: {
        [Op.or]: [
            { id_product1: id_product },
            { id_product2: id_product },
            { id_product3: id_product },
            { id_product4: id_product },
            { id_product5: id_product }
        ]
    }
});
```

---

### 4. ORGANIZATION → PUBLICATION

**Delete Order:**
1. Check participant count (prevent if > 1)
2. Delete all participants
3. Find all publications (id_org = this org)
4. Delete publication images
5. Delete publication records
6. Delete organization folder
7. Delete organization record

**Uses Transaction:** ✅ Yes (ensures atomicity)

---

## Filesystem Cleanup

### Image Deletion Patterns

All image deletions follow this pattern:

```javascript
if (entity.image_field) {
    const imagePath = path.join(__dirname, '..', '..', entity.image_field);
    try {
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`Image deleted: ${entity.image_field}`);
        }
    } catch (err) {
        console.error('Error deleting image:', err);
        // Continue with entity deletion even if image deletion fails
    }
}
```

### Folder Deletion Patterns

```javascript
const folderPath = path.join(__dirname, '..', '..', 'assets', 'images', '{type}', entity.name);

if (fs.existsSync(folderPath)) {
    try {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Folder deleted: ${folderPath}`);
    } catch (err) {
        console.error('Error deleting folder:', err);
        // Continue even if folder deletion fails
    }
}
```

### Directory Structure

```
back-end/assets/images/
│
├── users/
│   └── {user_name}/
│       ├── profile_image/
│       └── publications/
│
├── shops/
│   └── {shop_name}/
│       ├── cover_image/
│       ├── profile_image/
│       ├── products/
│       │   └── {product_name}/
│       └── packages/
│
└── organizations/
    └── {org_name}/
        ├── profile_image/
        └── publications/
```

---

## Order Protection Logic

### Current Implementation (Priority 1 ✅)

**USER deletion only:**
```javascript
// Check for active orders
const activeOrders = await order_model.findAll({
    where: {
        id_user: id_user,
        order_status: {
            [Op.in]: ['pending', 'confirmed', 'preparing', 'ready']
        }
    }
});

if (activeOrders && activeOrders.length > 0) {
    return {
        error: `Cannot delete user with ${activeOrders.length} active order(s)`,
        details: "Complete or cancel active orders first"
    };
}
```

### Pending Implementation (Priority 2 ⚠️)

**PRODUCT deletion should check:**
```javascript
// Check if product is in any order_product
const ordersWithProduct = await order_product_model.findAll({
    where: { id_product: id_product }
});

// Get order statuses
const activeOrdersWithProduct = // filter for active orders

if (activeOrdersWithProduct.length > 0) {
    return { error: "Product is in active orders" };
}
// Allow deletion of products only in completed/delivered orders
```

**PACKAGE deletion should check:**
```javascript
// Check if package is in any order_package
const ordersWithPackage = await order_package_model.findAll({
    where: { id_package: id_package }
});

// Similar logic to products
```

**SHOP deletion should check:**
```javascript
// Check if shop has any active orders
const activeShopOrders = await order_model.findAll({
    where: {
        id_shop: id_shop,
        order_status: {
            [Op.in]: ['pending', 'confirmed', 'preparing', 'ready']
        }
    }
});

if (activeShopOrders.length > 0) {
    return { error: "Shop has active orders" };
}
```

---

## Implementation Status

### ✅ Priority 1 - COMPLETE

| Entity | Cascade Implementation | Image Cleanup | Folder Cleanup | Order Check |
|--------|----------------------|---------------|----------------|-------------|
| USER | ✅ Full cascade | ✅ Yes | ✅ Yes | ✅ Active orders |
| SHOP | ✅ Products + Packages | ✅ Yes | ✅ Yes | ⚠️ No |
| PRODUCT | ✅ Deletes packages | ✅ Yes | ✅ Yes | ⚠️ No |
| PACKAGE | ✅ Direct delete | ✅ Yes | N/A | ⚠️ No |
| ORGANIZATION | ✅ Publications | ✅ Yes | ✅ Yes | N/A |
| PUBLICATION | ✅ Direct delete | ✅ Yes | N/A | N/A |

### ⚠️ Priority 2 - PENDING

| Entity | Needed Implementation | Status |
|--------|----------------------|--------|
| PRODUCT | Check order_product before deletion | ⚠️ Pending |
| PACKAGE | Check order_package before deletion | ⚠️ Pending |
| SHOP | Check orders before deletion | ⚠️ Pending |
| ORDER | Create deletion function with cascades | ❌ Not implemented |

### 📝 Priority 3 - FUTURE ENHANCEMENTS

- Soft deletes for orders (mark as deleted, don't remove)
- Transaction support for all multi-step deletions
- Audit log of deletions
- Restore functionality for soft deletes
- Batch deletion operations with progress tracking

---

## Testing Checklist

### User Deletion Tests
- [ ] Delete user with no data → Should succeed
- [ ] Delete user with 1 shop → Should cascade
- [ ] Delete user with multiple shops → Should cascade all
- [ ] Delete user with organization → Should cascade
- [ ] Delete user with active orders → Should PREVENT
- [ ] Verify all images deleted from filesystem
- [ ] Verify all folders deleted from filesystem

### Shop Deletion Tests
- [ ] Delete shop with no products → Should succeed
- [ ] Delete shop with products → Should prevent (removeById)
- [ ] Delete shop with products (removeByIdWithProducts) → Should cascade
- [ ] Delete shop with packages → Should cascade
- [ ] Delete shop with products in packages → Should cascade all
- [ ] Verify shop folder deleted

### Product Deletion Tests
- [ ] Delete product not in any package → Should succeed
- [ ] Delete product in 1 package → Should delete package
- [ ] Delete product in multiple packages → Should delete all packages
- [ ] Verify product image deleted
- [ ] Verify package images deleted

### Organization Deletion Tests
- [ ] Delete org with 1 participant → Should succeed
- [ ] Delete org with >1 participant → Should PREVENT
- [ ] Delete org with publications → Should cascade
- [ ] Verify publication images deleted
- [ ] Verify org folder deleted

### Publication Deletion Tests
- [ ] Delete standalone publication → Should succeed
- [ ] Delete organization publication → Should succeed
- [ ] Verify image deleted in correct location

---

## Summary

This database uses **manual referential integrity** without Sequelize associations or SQL foreign keys. All cascades are implemented explicitly in controller code.

**Cascade Approach:**
1. Manual queries to find related records
2. Manual iteration and deletion
3. Manual filesystem cleanup
4. Detailed logging
5. Error handling that continues on non-critical failures

**Benefits:**
- Full control over deletion order
- Ability to add business logic (e.g., order checks)
- Detailed logging and error reporting
- Granular control over what gets deleted

**Trade-offs:**
- More code to maintain
- Must manually ensure all cascades are implemented
- Risk of orphaned data if cascade logic has bugs
- No automatic enforcement by database

**Current State:**
- ✅ All critical cascades implemented
- ✅ Filesystem cleanup working
- ⚠️ Order checks only for user deletion
- ❌ Order deletion not implemented

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-01-20  
**Next Review:** After Priority 2 implementation
