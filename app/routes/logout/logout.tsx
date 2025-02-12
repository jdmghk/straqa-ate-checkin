// import type { Route } from "./+types/sign-in";
import { Link, redirect, useFetcher } from "react-router";
import { destroySession, getSession } from "app/session.server";

import { Button } from "~/components/ui/button";

import { Loading02 } from "@untitled-ui/icons-react";
// import type { Route } from "./+types/logout";

export async function action({ request }: any) {
  // export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function LogoutRoute() {
  const fetcher = useFetcher();
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10'>
      <p>Are you sure you want to log out?</p>
      <fetcher.Form method='post'>
        <Button type='submit' className='w-full'>
          {fetcher?.state !== "idle" && <Loading02 className='animate-spin' />}
          <span>Logout</span>
        </Button>
      </fetcher.Form>
      <Link to='/' viewTransition>
        Never mind
      </Link>
    </div>
  );
}
