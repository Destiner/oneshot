const PORT = process.env.PORT ?? 3000;

function getPort() {
  return PORT;
}

function getStaticPath(path: string) {
  return `http://localhost:${getPort()}/static/${path}`;
}

export { getPort, getStaticPath };
