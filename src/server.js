import app from './app';

const port = parseInt(process.env.PORT, 10) || 3333;

app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`The magic is at port ${port}... Have a good time!`)
);
