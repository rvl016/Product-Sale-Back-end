# Vendor-Sale App

JSON API to manage products in stock and sales.

## Used Stack

ExpressJS, TypeORM as Postgresql

## Running

### Tests

```properties
  cd "$(PROJECT_ROOT)"
  chmod +x test_app.sh
  ./test_app.sh
```

This will run a postgres container, but app locally (host).

### Development Server

```properties
  cd "$(PROJECT_ROOT)"
  chmod +x start_postgres_conteiner.sh
  ./start_postgres_container.sh
  npm start
```

This will run a postgres container, but app locally (host).

### Production Server

```properties
  cd "$(PROJECT_ROOT)"
  chmod +x make_container.sh
  ./make_container.sh
```

This will run both postgres and server as containers.

## Endpoints

### Products

**GET on**

/products

/products/:id

**POST on**

/products

```js
{
  name: "Product name",
  code: "1010101010", // 10 digits
  price: 10,
  quantity: 2
}
```

**PUT on**

/products/:id

**DELETE on**

/products/:id

 
### Sales

**GET on**

/sales

/sales/:id

**POST on**

/sales

```js
{
  customer_cpf: "123456789-12", // Must be in this format
  products: [
    {
      code: "1010101010", // 10 digits
      quantity: 2
    },
    {
      code: "1212121212",
      quantity: 2
    }
  ]
}
```

**PUT on**

/sales/:id

**DELETE on**

/sales/:id
