import DesktopView from "@/component/Dashboard";
import MobileApp from "@/component/MobileApp";
import Dashboard from "@/component/Dashboard";
import DesktopApp from "@/component/DesktopApp";
import Login from "@/component/Login";
import HomePage from "@/component/HomePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <Suspense fallback={<></>}>
      <HomePage />
    </Suspense>
      
      
    </>
  );
}