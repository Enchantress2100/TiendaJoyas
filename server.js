//importar npm's
const express = require('express')
const app = express()
const joyas = require('./data/joyas.js')

//disponibilizar la carpeta data para acceder a la informacion
app.use(express.static('data'))

//crear la ruta para la devolucion de todas las joyas usando HATEOAS
//permitir hacer paginacion con query strings
//http://localhost:3000/api/v1/joyas?page=2
//permitir ordenamiento de las joyas segun su valor de forma ascendente o descendente con los query strings
//http://localhost:3000/api/v1/joyas?values=desc
//http://localhost:3000/api/v1/joyas?values=asc

const orderValues = (order) => {
  return order == "asc"
    ? joyas.sort((a, b) => (a.value > b.value ? 1 : -1))
    : order == "desc"
    ? joyas.sort((a, b) => (a.value < b.value ? 1 : -1))
    : false;
};

const HATEOAS = () => joyas.map(joya => ({ name: joya.name, id: joya.id, model:joya.model, category: joya.category, metal: joya.metal, value: joya.value, stock: joya.stock, href: `http://localhost:3000/api/v1/joya/${joya.id}` }));
app.get('/api/v1/joyas', (req, res) => {
  const { values } = req.query;
  if (values == "asc") return res.send(orderValues("asc"));
  if (values == "desc") return res.send(orderValues("desc"));
  if (req.query.page) {
    const { page } = req.query;
    return res.send({ joyas: HATEOAS().slice(page * 2 - 2, page * 2) });
  }
    res.send({
      joyas: HATEOAS(),
    })
})

//hacer una segunda version de la api que ofrezca los mismos datos pero con nombres de propiedades diferentes
//permitir hacer paginacion con query strings
//http://localhost:3000/api/v2/joyas?page=2
//permitir ordenamiento de las joyas segun su valor de forma ascendente o descendente con los query strings
//http://localhost:3000/api/v2/joyas?cost=asc
//http://localhost:3000/api/v2/joyas?cost=desc


const orderCost = (order) => {
  return order == "asc"
    ? joyas.sort((a, b) => (a.value > b.value ? 1 : -1))
    : order == "desc"
    ? joyas.sort((a, b) => (a.value < b.value ? 1 : -1))
    : false;
};

const HATEOASV2 = () =>
  joyas.map((joya) => ({jewel: joya.name,identification: joya.id,ejemplar: joya.model,type: joya.category,material: joya.metal,cost: joya.value,inventario: joya.stock,location: `http://localhost:3000/api/v2/joya/${joya.id}`,
  }));
app.get('/api/v2/joyas', (req, res) => {
  const { cost } = req.query
  if (cost == "asc") return res.send(orderCost("asc"));
  if (cost == "desc") return res.send(orderCost("desc"));
  if (req.query.page) {
    const { page } = req.query
    return res.send({ joyas: HATEOASV2().slice(page * 2 - 2, page * 2) })
  }
    res.send({
      joyas:HATEOASV2(),
    })
})

//ofrecer una ruta con la que se puedan filtrar las joyas por categoria
const filterByCategory = (category) => {
  return joyas.filter(joya=>joya.category === category)
}
app.get('/api/v2/category/:type', (req, res) => {
  const type = req.params.type
  res.send(filterByCategory(type))
})

//crear una ruta que permita el filtrado de una joya a consultar (por nombre)
const filterByName = (name) => {
  return joyas.filter(joya =>joya.name===name)
}
app.get('/api/v2/name/:name', (req,res)=> {
  const name = req.params.name
  res.send(filterByName(name))
})

//acceder primero a id's especificas de las joyas
const joya = (id) => {
  return joyas.find(joya =>joya.id ==id)
}

app.get("/api/v1/joya/:id", (req, res) => {
  const id = req.params.id;
  //crear una ruta que devuelva como payload un JSON con un mensaje de error cuando el usuario consulte el id de una joya que no exista
  joya(id)
    ? res.send({ joya: joya(id) })
    : res.status(404).json({
      error: '404 Not Found',
      message: 'No existe una joya con ese ID'
    });
});

app.get('/api/v2/joya/:id', (req, res) => {
  const id = req.params.id;
  //crear una ruta que devuelva como payload un JSON con un mensaje de error cuando el usuario consulte el id de una joya que no exista
  joya(id)
    ? res.send({ joya: joya(id) })
    : res.status(404).json({
        error: "404 Not Found",
        message: "No existe una joya con ese ID",
      });
});

//creacion del servidor
app.listen(3000, () => console.log('Server ON and working OK'))