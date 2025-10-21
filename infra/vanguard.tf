provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "vanguard" {
  name     = "vanguard-rg"
  location = "East US"
}

resource "azurerm_app_service_plan" "vanguard_plan" {
  name                = "vanguard-plan"
  location            = azurerm_resource_group.vanguard.location
  resource_group_name = azurerm_resource_group.vanguard.name
  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_app_service" "vanguard_app" {
  name                = "vanguard-app"
  location            = azurerm_resource_group.vanguard.location
  resource_group_name = azurerm_resource_group.vanguard.name
  app_service_plan_id = azurerm_app_service_plan.vanguard_plan.id

  site_config {
    node_version = "18"
  }

  app_settings = {
    MONGO_URI    = "your-mongo-uri"
    JWT_SECRET   = "your-jwt-secret"
  }
}
