import 'dotenv/config';
import express from 'express';
import { v4 as uuidV4 } from 'uuid';

const app = express();
app.use(express.json());

const customers = [];

// middleware
function verifyIfExistAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: 'Customer not found' })
  }

  request.customer = customer;

  return next();
}

// helper
function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExist = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExist) {
    return response.status(400).json({ error: 'Customer already exists!' })
  }

  customers.push({
    id: uuidV4(),
    name,
    cpf,
    statement: []
  });

  return response.status(201).send();
});

app.get('/statement', verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.post('/deposit', verifyIfExistAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient funds!' })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get('/statement/date', verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + ' 00:00');

  const statement = customer.statement.filter(
    (statement) => statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return response.json(statement);
});

app.put('/account', verifyIfExistAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
})

app.get('/account', verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer);
});

app.get('/accounts', (request, response) => {
  return response.status(200).json(customers);
})

app.delete('/account', verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  customers.splice(customer, 1);

  return response.status(200).json(customers);
});

app.get('/balance', verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance);
});

app.listen(
  process.env.PORT,
  () => console.log(`Server started at http://localhost:${process.env.PORT}`)
);
