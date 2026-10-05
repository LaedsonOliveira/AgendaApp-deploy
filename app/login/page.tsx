import LoginForm from "./LoginForm";

interface Props {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { returnTo } = await searchParams;
  return <LoginForm returnTo={Array.isArray(returnTo) ? returnTo[0] : returnTo} />;
}
