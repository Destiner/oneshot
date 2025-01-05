const PORT = process.env.PORT ?? 43865;

function getPort() {
  return PORT;
}

function getStaticPath(path: string) {
  return `http://localhost:${getPort()}/static/${path}`;
}

export { getPort, getStaticPath };
