"use client";

import ContinueWithGoogleButton from "@/components/continue-with-google-button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useLanguage } from "@/context/language";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{t("auth.login.title")}</CardTitle>
        <CardDescription>
          {t("auth.login.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          {t("auth.login.title")}
        </Button>
        <p className="text-sm text-muted-foreground">{t("auth.or")}</p>
        <ContinueWithGoogleButton />
      </CardFooter>
      <CardAction>
        <div className="flex justify-center">
          <Button variant="link" className="text-center" asChild>
            <Link className="text-sm hover:underline text-center" href="/register">
              {t("auth.dontHaveAccount")}
            </Link>
          </Button>
        </div>
      </CardAction>
    </Card>
  );
}