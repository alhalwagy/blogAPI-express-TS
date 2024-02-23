export function checkJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.log('Missing secret in env file.');

    process.exit(1);
  }

  return secret;
}
