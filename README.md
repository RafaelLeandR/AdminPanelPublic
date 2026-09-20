# WhatsApp Store Admin Panel

A web-based administration panel for managing virtual stores focused on **WhatsApp-based sales**.

This project started from a purchased **React e-commerce template**, which was adapted and integrated with **Firebase** to create a complete store management system.

## Overview

The Admin Panel allows store owners to manage the information and products displayed on their virtual store.

The project was developed to provide a simple way to manage a WhatsApp-based online store, where customers can browse products and contact the store through WhatsApp to complete their purchases.

### Admin Panel

**URL:** https://siteadmin.com.br/admin

The administration panel provides functionality for managing:

* Products
* Categories
* Brands
* Tags
* Store information
* Homepage content
* Images
* Banners and carousel images
* Other store data

### Store

**Demo Store:** https://siteadmin.com.br/lojateste

The store frontend displays the products and information managed through the administration panel.

## Technologies

* React
* React Admin
* Firebase
* Firebase Firestore
* Firebase Storage
* React Router
* Material UI
* JavaScript
* Vite

## Firebase Integration

The original React template was adapted to work with Firebase.

Firestore is used as the database for storing store and product information, while Firebase Storage is used for storing product images, logos, banners, and other media.

The administration panel communicates with Firebase to create, read, update, and manage store data.

## Architecture

The project is structured around a separation between the administration system and the public storefront:

```text
                    ┌─────────────────────┐
                    │      Firebase       │
                    │                     │
                    │  Firestore          │
                    │  Storage            │
                    │  Authentication     │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
        ┌────────▼────────┐       ┌────────▼────────┐
        │   Admin Panel   │       │  Public Store   │
        │                 │       │                 │
        │ React Admin     │       │ React Storefront│
        │ Product CRUD    │       │ Product Catalog │
        │ Store Settings  │       │ WhatsApp Sales  │
        └─────────────────┘       └─────────────────┘
```

## Main Features

### Product Management

Products can be created and managed through the administration panel, including information such as:

* Product name
* Price
* Description
* Images
* Categories
* Brands
* Tags
* Store association

### Store Management

The system was designed with support for multiple stores. Store-specific data can be associated with a store identifier, allowing the same administration infrastructure to manage different storefronts.

### Image Management

Images can be uploaded to Firebase Storage and associated with products and other store content.

### WhatsApp-Based Shopping

The storefront is designed around WhatsApp as the primary sales channel. Customers can browse the catalog and use WhatsApp to contact the store regarding products and purchases.

## Project Background

The frontend originated from a commercially purchased React e-commerce template.

The template was subsequently customized and expanded to:

1. Integrate Firebase as the backend infrastructure.
2. Replace the original data management approach with Firestore.
3. Add Firebase Storage for media management.
4. Build an administration panel using React Admin.
5. Implement product and store management functionality.
6. Connect the administration panel with the public storefront.
7. Adapt the storefront for WhatsApp-based sales.

## Deployment

The project is deployed using a custom domain:

**Admin Panel**

https://siteadmin.com.br/admin

**Public Store**

https://siteadmin.com.br/lojateste

## Status

The project is currently under development, with additional features and improvements being added to the administration system and storefront.

## License

This project contains components based on a commercially purchased React template. The original template's license and terms remain applicable to its proprietary components.

Custom code developed for the Firebase integration, administration system, and project-specific functionality is part of this project.
