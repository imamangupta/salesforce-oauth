const express = require('express')
const cors = require('cors');
const port = 3000


const app = express()
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})


var indexRouter = require('./routes/index');
app.use('/api', indexRouter);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
