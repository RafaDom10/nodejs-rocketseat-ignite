import 'dotenv/config';
import express from 'express';
import { v4 as uuidV4 } from 'uuid';

const app = express();
app.use(express.json());

const customers = [];

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;
  const id = uuidV4();

  customers.push({
    id,
    name,
    cpf,
    statement: []
  });

  return response.status(201).send();
});

app.listen(process.env.PORT, () => console.log(`Server started at http://localhost:${process.env.PORT}`));
