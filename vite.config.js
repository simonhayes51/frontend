const port = parseInt(process.env.PORT) || 8080;

export default {
  server: {
    host: '0.0.0.0',
    port,
  },
  preview: {
    host: '0.0.0.0',
    port,
  }
}