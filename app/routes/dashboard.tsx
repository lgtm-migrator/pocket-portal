import { LinksFunction, LoaderFunction, json } from "@remix-run/node"
import { Outlet, useCatch, useLoaderData } from "@remix-run/react"
import { useEffect } from "react"
import { Auth0Profile } from "remix-auth-auth0"
import analyticsInit from "../utils/analytics"
import styles from "~/styles/dashboard.css"
import { requireUserProfile } from "~/utils/session.server"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
}

type LoaderData = {
  user: Awaited<Auth0Profile>
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserProfile(request, "/api/auth/auth0")
  return json<LoaderData>({
    user: user,
  })
}

export default function Dashboard() {
  const { user } = useLoaderData() as LoaderData

  useEffect(() => {
    analyticsInit(user)
  }, [user])

  return <Outlet />
}

export const CatchBoundary = () => {
  const caught = useCatch()
  if (caught.status === 404) {
    return (
      <div className="error-container">
        <h1>Dashboard Error</h1>
        <p>{caught.statusText}</p>
      </div>
    )
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <div className="error-container">
      <h1>Dashboard Error</h1>
      <p>{error.message}</p>
    </div>
  )
}
