import { AppContextProvider } from "./app_context/AppContextProvider.jsx";
import './App.css'
import LoginRegisterForm from "./components/login_register/login_register_form/LoginRegisterForm.jsx";
import TopBar from "./components/top_bar/TopBar.jsx";


function App() {

  return (
      <AppContextProvider>
        <TopBar />
        <LoginRegisterForm />
      </AppContextProvider>
  )
}

export default App;