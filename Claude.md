# Claude.md - Project Documentation & Guidelines

## 📋 Working Instructions

### Code Modification Rules

**VERY IMPORTANT:**
- **Only modify code when explicitly requested by the user**
- Do not change functionality that works and is unrelated to the current issue
- When modifying code (under user command only):
  - Add an `//update:` comment above modified code
  - Remove old or previous `//update:` comments (keep only latest)
  - Do NOT add update comments in CSS styles
  - Do NOT add update comments in database SQL scripts

### File Modification Guidelines

- Read instructions carefully line by line
- Study the file tree deeply to avoid mistakes
- Maintain all existing functionality when updating files
- Files will be updated directly using the appropriate tools

### Workflow Before Execution

**Before proceeding with any task:**

1. **For Bug Fixes:** Elaborate an explanation of why the problem is occurring
2. **For New Features/Edits:** Provide a summary of what will be done

### Change Priority

**IMPORTANT:**
1. **First Priority:** Make changes in the front-end if possible
2. **Second Priority:** Only make back-end changes if the front-end cannot solve the problem

---

## 🏗️ Application Architecture

### Overview

The application uses **Docker** to separate concerns:

- **Frontend:** Single Page Application (React) in its own space
- **Backend:** Node.js/Express API in Docker container
- **Database:** MySQL in Docker container
- **Network:** All containers connected via Docker network

### Backend Architecture

The backend implements **separation of concerns**:

- **API Requests:** Entry points for client communication
- **Controllers:** Business logic and data manipulation
- **Routers:** Route definitions and middleware
- **Models:** Database schema definitions (Sequelize ORM)

### Frontend Architecture

- **Framework:** ReactJS with modular component structure
- **Design:** Mobile-first and responsive (maintain at all times)
- **Structure:** Base/main components containing child components
- **Entities:** Handles different system entities and users

**IMPORTANT:** Maintain mobile-first and responsive design principles at all times when working on the front-end.

---

## 🐳 Docker Configuration

### Dockerfile

```dockerfile
FROM node:22.9.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /app/public/images/uploads/users \
	    /app/public/images/uploads/shops \
	    /app/public/images/uploads/temp && \
    find /app/public/images/uploads -type d -exec chmod 755 {} + && \
    find /app/public/images/uploads -type f -exec chmod 755 {} + && \
    chown -R node:node /app/public/images/uploads

EXPOSE 3000

CMD ["node", "back-end/index.js"]
```

### docker-compose.yml

```yaml
services:
  db:
    image: mysql:8.0
    container_name: ${MYSQL_HOST}
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    ports:
      - ${MYSQL_PORT}:3306
    volumes:
      - data:/var/lib/mysql
      - ./db/scripts:/docker-entrypoint-initdb.d

  backend:
    build: .
    container_name: ${BACKEND_HOST}
    restart: unless-stopped
    ports:
      - ${APP_PORT}:3000
    depends_on:
      - db
    env_file:
      - .env
    environment:
      - MYSQL_PORT=3306
      - MYSQL_HOST=${MYSQL_HOST}
    volumes:
      - .:/app
      - /app/node_modules
      - ./public:/app/public
      - ./public/images/uploads:/app/public/images/uploads

volumes:
  data:
```

---

## 📦 Dependencies

### Backend (package.json)

```json
{
  "name": "uribarri.online",
  "version": "1.0.0",
  "description": "gestión de pedidos y reservas online para comercios locales del distrito02 de Bilbao.",
  "main": "back-end\\index.js",
  "type": "module",
  "scripts": {
    "test": "jest",
    "dev": "nodemon back-end\\index.js",
    "start": "node back-end\\index.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "2.8.5",
    "dotenv": "16.4.5",
    "express": "^4.21.2",
    "multer": "^1.4.5-lts.1",
    "mysql2": "3.11.4",
    "nodemailer": "^6.9.7",
    "sequelize": "6.37.5",
    "sharp": "^0.33.5",
    "validate-image-type": "^3.0.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/multer": "^1.4.12",
    "globals": "15.11.0",
    "nodemon": "^3.1.10"
  }
}
```

**Key Backend Technologies:**
- Express.js for API
- Sequelize ORM for MySQL
- Multer for file uploads
- Sharp for image processing
- Bcrypt for password hashing
- Nodemailer for email

### Frontend (package.json)

```json
{
  "name": "front-end",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-spring/web": "^9.7.5",
    "axios": "1.7.7",
    "leaflet": "^1.9.4",
    "lucide-react": "0.456.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-leaflet": "^5.0.0-rc.2",
    "react-router-dom": "7.0.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.16",
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "globals": "15.11.0",
    "vite": "^6.2.1"
  }
}
```

**Key Frontend Technologies:**
- React 18.3.1
- Vite (build tool)
- React Router DOM for routing
- Axios for HTTP requests
- Leaflet for maps
- Lucide React for icons
- React Spring for animations

---

## 📂 Frontend File Structure

```
├── /front-end
    ├── index.html
    ├── /public
        ├── /images
            ├── /icons
            └── /portraits
    ├── /src
        ├── App.jsx
        ├── main.jsx
        ├── /app_context
        │   ├── AppContext.js
        │   ├── AuthContext.jsx
        │   ├── PackageContext.jsx
        │   ├── ProductContext.jsx
        │   ├── ShopContext.jsx
        │   ├── OrderContext.jsx
        │   ├── OrganizationContext.jsx
        │   ├── PublicationContext.jsx
        │   └── UIContext.jsx
        ├── /components
        │   ├── /card_display
        │   │   ├── /components
        │   │   ├── CardDisplay.jsx
        │   │   └── CardDisplayUtils.jsx
        │   ├── /confirmation_modal
        │   │   └── ConfirmationModal.jsx
        │   ├── /custom_number_input
        │   │   ├── CustomNumberInput.jsx
        │   │   └── CustomNumberInput.module.css
        │   ├── /filters_for_products
        │   │   ├── FiltersForProducts.jsx
        │   │   └── FiltersForProductsUtils.jsx
        │   ├── /image_modal
        │   │   └── ImageModal.jsx
        │   ├── /landing_page
        │   │   ├── LandingPage.jsx
        │   │   └── LandingPageUtils.jsx
        │   ├── /login_register
        │   │   ├── /components
        │   │   ├── LoginRegisterForm.jsx
        │   │   └── LoginRegisterFormUtils.jsx
        │   ├── /navigation_components
        │   │   ├── CustomToggleSwitch.jsx
        │   │   ├── NavigationButtons.jsx
        │   │   └── StepTracker.jsx
        │   ├── /Obutton
        │   │   ├── Obutton.jsx
        │   │   └── Obutton.module.css
        │   ├── /shop_management
        │   │   ├── /components
        │   │   │   ├── /shops_list_by_seller
        │   │   │   │   ├── /components
        │   │   │   │   │   ├── /shop_orders_list
        │   │   │   │   │   ├── ShopLimitIndicator.jsx
        │   │   │   │   │   ├── ShopRow.jsx
        │   │   │   │   │   ├── ShopTable.jsx
        │   │   │   │   │   └── ShopTypeManagementForm.jsx
        │   │   │   ├── /shop_creation_form
        │   │   │   ├── /shop_card
        │   │   │   └── /product_management
        │   │   │       ├── /components
        │   │   │       │   ├── /product_card
        │   │   │       │   │   └── ProductCard.jsx
        │   │   │       │   ├── /product_creation_form
        │   │   │       │   │   ├── /components
        │   │   │       │   │   │   ├── ProductBasicInfo.jsx
        │   │   │       │   │   │   ├── ProductDetails.jsx
        │   │   │       │   │   │   └── ProductImageUpload.jsx
        │   │   │       │   │   ├── ProductCreationForm.jsx
        │   │   │       │   │   └── ProductCreationFormUtils.jsx
        │   │   │       │   ├── /product_image
        │   │   │       │   │   ├── ProductImage.jsx
        │   │   │       │   │   └── ProductImageUtils.jsx
        │   │   │       │   └── /shop_products_list
        │   │   │       │       ├── /components
        │   │   │       │       │   ├── /package_creation_form
        │   │   │       │       │   │   ├── PackageCreationForm.jsx
        │   │   │       │       │   │   └── PackageCreationFormUtils.jsx
        │   │   │       │       │   ├── /shops_packages_list
        │   │   │       │       │   │   ├── /components
        │   │   │       │       │   │   │   └── /offers_board
        │   │   │       │       │   │   │       └── OffersBoard.jsx
        │   │   │       │       │   ├── ActionButtons.jsx
        │   │   │       │       │   ├── NoProductsMessage.jsx
        │   │   │       │       │   ├── NoShopSelected.jsx
        │   │   │       │       │   ├── ProductActionsCell.jsx
        │   │   │       │       │   ├── ProductsCount.jsx
        │   │   │       │       │   ├── ProductsTable.jsx
        │   │   │       │       │   ├── ProductTableHeader.jsx
        │   │   │       │       │   ├── ProductTableRow.jsx
        │   │   │       │       │   └── SearchBar.jsx
        │   │   │       │       ├── ProductManagement.jsx
        │   │   │       │       └── ProductManagementUtils.jsx
        │   │   ├── ShopManagement.jsx
        │   │   └── ShopManagementUtils.jsx
        │   ├── /shop_window
        │   │   ├── /components
        │   │   │   ├── /recommendedFilters
        │   │   │   │   ├── RecommendedFilters.jsx
        │   │   │   │   └── RecommendedFiltersUtils.jsx
        │   │   │   └── /filters_for_shops
        │   │   │       ├── FiltersForShops.jsx
        │   │   │       └── FiltersForShopsUtils.jsx
        │   │   └── ShopWindow.jsx
        │   ├── /shop_store
        │   │   ├── /components
        │   │   │   └── ShopStoreFilters.jsx
        │   │   ├── ShopStoreUtils.jsx
        │   │   └── ShopStore.jsx
        │   ├── /top_bar
        │   │   ├── /components
        │   │   ├── TopBar.jsx
        │   │   └── TopBarUtils.jsx
        │   ├── /info_management
        │   │   ├── /components
        │   │   │   ├── ActionButtonsPublication.jsx
        │   │   │   ├── FiltersForOrganizations.jsx
        │   │   │   ├── InfoBoard.jsx
        │   │   │   ├── OrganizationsList.jsx
        │   │   │   ├── PublicationCreationForm.jsx
        │   │   │   ├── Publicationmanagement.jsx
        │   │   │   ├── ParticipantRequests.jsx
        │   │   │   ├── PendingTransfersBadge.jsx
        │   │   │   ├── TransferOrganization.jsx
        │   │   │   └── OrganizationCreationForm.jsx
        │   │   └── InfoManagement.jsx
        │   ├── /user_info_card
        │   │   ├── UserInfoCard.jsx
        │   │   └── UserInfoCardUtils.jsx
        │   ├── /rider_order_management
        │   │   └── RiderOrderManagement.jsx
        │   └── /user_management
        │       ├── /components
        │       ├── UserManagement.jsx
        │       └── UserManagementUtils.jsx
        └── /utils
            ├── /animation
            ├── /app
            ├── /image
            └── /user
    └── /public
        └── /css
        └── /images
            └── /uploads
                └── /users
```

---

## 📂 Backend File Structure

```
├── /back-end
    ├── index.js
    ├── /assets
    │   └── /images
    │       ├── /users
    │       └── /shops
    │           └── /<shop_name>
    │               ├── /cover_image
    │               ├── /package_images
    │               └── /product_images
    ├── /config
    │   └── sequelize.js
    ├── /controllers
    │   ├── /organization
    │   │   ├── organization_api_controller.js
    │   │   └── organization_controller.js
    │   ├── /participant
    │   │   ├── participant_api_controller.js
    │   │   └── participant_controller.js
    │   ├── /publication
    │   │   ├── publication_api_controller.js
    │   │   └── publication_controller.js
    │   ├── /social_event
    │   │   ├── social_event_api_controller.js
    │   │   └── social_event_controller.js
    │   ├── /package
    │   │   ├── package_api_controller.js
    │   │   └── package_controller.js
    │   ├── /product
    │   │   ├── product_api_controller.js
    │   │   └── product_controller.js
    │   ├── /provider
    │   │   ├── provider_api_controller.js
    │   │   └── provider_controller.js
    │   ├── /shop
    │   │   ├── shop_api_controller.js
    │   │   └── shop_controller.js
    │   ├── /user
    │   │   ├── user_api_controller.js
    │   │   └── user_controller.js
    │   ├── /calification_product
    │   │   ├── calification_product_api_controller.js
    │   │   └── calification_product_controller.js
    │   ├── /calification_shop
    │   │   ├── calification_shop_api_controller.js
    │   │   └── calification_shop_controller.js
    │   ├── /product_category
    │   │   ├── product_category_api_controller.js
    │   │   └── product_category_controller.js
    │   ├── /product_subcategory
    │   │   ├── product_subcategory_api_controller.js
    │   │   └── product_subcategory_controller.js
    │   ├── /subtype
    │   │   ├── subtype_api_controller.js
    │   │   └── subtype_subcategory_controller.js
    │   ├── /type
    │   │   ├── type_api_controller.js
    │   │   └── type_subcategory_controller.js
    │   ├── /category_subcategory
    │   │   ├── category_subcategory_api_controller.js
    │   │   └── category_subcategory_controller.js
    │   ├── /order
    │   │   ├── order_api_controller.js
    │   │   └── order_controller.js
    │   ├── /order_package
    │   │   ├── order_package_api_controller.js
    │   │   └── order_package_controller.js
    │   ├── /order_product
    │   │   ├── order_product_api_controller.js
    │   │   └── order_product_controller.js
    │   ├── /shop_valoration
    │   │   ├── shop_valoration_api_controller.js
    │   │   └── shop_valoration_controller.js
    │   └── /type_category
    │       ├── type_category_api_controller.js
    │       └── type_category_controller.js
    ├── /middleware
    │   ├── ProductUploadMiddleware.js
    │   ├── ProfileUploadMiddleware.js
    │   ├── PackageUploadMiddleware.js
    │   └── ShopUploadMiddleware.js
    ├── /models
    │   ├── buys_model.js
    │   ├── ip_registry_model.js
    │   ├── user_model.js
    │   ├── order_model.js
    │   ├── order_package_model.js (recently added)
    │   ├── package_model.js
    │   ├── product_model.js
    │   ├── order_product_model.js (recently added)
    │   ├── provider_model.js
    │   ├── shop_model.js
    │   ├── type_model.js
    │   ├── subtype_model.js
    │   ├── shop_valoration_model.js (recently added)
    │   ├── shop_type_model.js (recently added)
    │   ├── shop_subtype_model.js (recently added)
    │   ├── calification_shop_model.js
    │   ├── category_subcategory_model.js (recently added)
    │   ├── calification_product_model.js
    │   ├── product_category_model.js
    │   ├── product_subcategory_model.js
    │   ├── organization_model.js
    │   ├── participant_model.js
    │   ├── publication_model.js
    │   ├── social_event_model.js
    │   └── type_category_model.js
    ├── /routers
    │   ├── main_router.js
    │   ├── api_router.js
    │   ├── package_api_router.js
    │   ├── product_api_router.js
    │   ├── provider_api_router.js
    │   ├── shop_api_router.js
    │   ├── calification_product_api_router.js
    │   ├── calification_shop_api_router.js
    │   ├── product_category_api_router.js
    │   ├── product_subcategory_api_router.js
    │   ├── subtype_api_router.js
    │   ├── type_api_router.js
    │   ├── type_category_api_router.js
    │   ├── category_subcategory_api_router.js (recently added)
    │   ├── shop_valoration_api_router.js (recently added)
    │   ├── order_product_api_router.js (recently added)
    │   ├── order_package_api_router.js (recently added)
    │   ├── organization_api_router.js
    │   ├── participant_api_router.js
    │   ├── publication_api_router.js
    │   └── social_event_api_router.js
    └── /utils
        └── imageValidationUtilities.js
├── /db
    └── /scripts
        └── 1DB_schema_gestionPedidosOnline_2024.sql
```

---

## 🎯 Key Entities & Features

### Main Entities
- **Users:** Customer and seller accounts
- **Shops:** Store management system
- **Products:** Product catalog and management
- **Packages:** Product bundles/offers
- **Orders:** Order processing system
- **Organizations:** Community organizations
- **Publications:** Information/news management
- **Social Events:** Event management

### Core Functionalities
1. **Authentication:** User login/registration
2. **Shop Management:** Create and manage shops
3. **Product Management:** CRUD operations for products
4. **Order Management:** Order creation and tracking
5. **Package/Offers System:** Bundle products together
6. **Rating System:** Shop and product ratings
7. **Image Upload:** Multi-entity image handling
8. **Info Management:** Organizations and publications
9. **Responsive UI:** Mobile-first design

---

## 🔧 Development Notes

### Image Upload Structure
- Users: `/back-end/assets/images/users/`
- Shops: `/back-end/assets/images/shops/<shop_name>/`
  - Cover images
  - Product images
  - Package images

### Recent Additions
- Order-product relationship models
- Order-package relationship models
- Shop valoration system
- Category-subcategory relationships
- Shop type/subtype systems

### Context Providers (State Management)
- AppContext: Global app state
- AuthContext: Authentication state
- PackageContext: Package data
- ProductContext: Product data
- ShopContext: Shop data
- OrderContext: Order data
- OrganizationContext: Organization data
- PublicationContext: Publication data
- UIContext: UI state management

---

## ✅ Checklist for Every Task

- [ ] Read requirements carefully line by line
- [ ] Study relevant file tree structure
- [ ] Before execution: Explain issue OR summarize planned changes
- [ ] Try to solve in frontend first
- [ ] Only modify requested code sections
- [ ] Add `//update:` comments (except CSS/SQL)
- [ ] Remove old `//update:` comments
- [ ] Maintain mobile-first responsive design
- [ ] Preserve existing working functionality

---

**Last Updated:** 2025-10-21
**Project:** uribarri.online - Online orders and reservations management for local businesses in distrito02, Bilbao
