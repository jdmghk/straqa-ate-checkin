import type { Route } from "./+types/sign-in";
import { data, redirect, useFetcher } from "react-router";
import { commitSession, getSession } from "app/session.server";

import ateLogo from "./ate-logo.svg";
import straqaLogo from "./straqa-logo.svg";
import image from "./image.jpg";

import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import { Loading02 } from "@untitled-ui/icons-react";
import { getClientIP } from "uitilities/ip";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Straqa Checkin - Africa Technology Expo" },
    {
      name: "description",
      content:
        "The Africa Technology Expo (ATE) is where Africa’s tech and business leaders gather with one clear goal: to make deals happen. It’s a space where enterprises, operators, and industry giants converge to showcase innovations, build partnerships, and deliver results.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("accessToken")) {
    return redirect("/checkin");
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

export async function action({ request }: Route.ActionArgs) {
  const ip = await getClientIP();

  console.log(ip);

  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  let errors: Record<string, string> = {};

  if (!email.includes("@")) {
    errors.email = "Invalid email address";
  }

  if (password.length < 8) {
    errors.password = "Password should be at least 8 characters";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_BASE_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const responseData = await response.json();

      session.flash(
        "error",
        responseData?.message || "Cannot reach authentication server."
      );

      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    const responseData = await response.json();

    session.set("accessToken", responseData?.data?.accessToken);
    session.set("refreshToken", responseData?.data?.refreshToken);
    session.set(
      "accessTokenExpiresAt",
      responseData?.data?.accessTokenExpiresAt
    );
    session.set(
      "refreshTokenExpiresAt",
      responseData?.data?.refreshTokenExpiresAt
    );

    // redirect to checkin
    return redirect("/checkin", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    session.flash("error", "Cannot reach authentication server.");

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;
  const fetcher = useFetcher();
  const errors = fetcher?.data?.errors;

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-3xl'>
        <div className='flex flex-col gap-6'>
          <Card className='overflow-hidden'>
            <CardContent className='grid p-0 md:grid-cols-2 min-h-96'>
              <fetcher.Form method='post' className='flex p-6 md:p-8'>
                <div className='flex-1 flex flex-col gap-6'>
                  <div className='flex items-center justify-center text-center gap-2.5'>
                    <img
                      src={ateLogo}
                      alt='Africa Technology Expo'
                      className='w-20'
                    />
                  </div>
                  <div className='flex-1 flex flex-col items-center justify-center gap-8 w-full'>
                    <div className='grid w-full gap-3'>
                      {error && (
                        <em className='text-red-400 text-xs'>{error}</em>
                      )}
                      <div className='grid gap-2 w-full'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                          id='email'
                          name='email'
                          type='email'
                          placeholder='m@example.com'
                        />
                        {errors?.email ? (
                          <em className='text-red-400 text-xs'>
                            {errors.email}
                          </em>
                        ) : null}
                      </div>
                      <div className='grid gap-2 w-full'>
                        <Label htmlFor='password'>Password</Label>
                        <Input id='password' name='password' type='password' />
                        {errors?.password ? (
                          <em className='text-red-400 text-xs'>
                            {errors.password}
                          </em>
                        ) : null}
                      </div>
                    </div>
                    <Button type='submit' className='w-full'>
                      {fetcher?.state !== "idle" && (
                        <Loading02 className='animate-spin' />
                      )}
                      <span>Login</span>
                    </Button>
                  </div>
                </div>
              </fetcher.Form>
              <div className='relative hidden bg-muted md:block'>
                <img
                  src={image}
                  alt='Image'
                  className='absolute inset-0 h-full w-full object-cover'
                />
              </div>
            </CardContent>
          </Card>
          <div className='text-balance text-center text-xs flex items-center justify-center gap-2'>
            <span>Powered by</span>{" "}
            <img src={straqaLogo} alt='Straqa' className='w-20' />
          </div>
        </div>
      </div>
    </div>
  );
}
