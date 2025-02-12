import type { Route } from "./+types/checkin-layout";
import { Outlet, data, redirect } from "react-router";
import { commitSession, getSession } from "app/session.server";
import Header from "~/components/header/header";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("accessToken")) {
    return redirect("/");
  }

  return data(
    { error: session.get("error") },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function CheckinLayout({}) {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
