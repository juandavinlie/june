import { NextApiRequest, NextApiResponse } from "next"
import { serialize } from "cookie"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { event, session } = req.body

    const d = serialize("user-id", "", {
      maxAge: -9999999,
      path: "/",
    })
    res.setHeader("Set-Cookie", d)

    if (session) {
      const id = session.user.id
      const cookie = serialize("user_id", id, {
        httpOnly: false,
        path: "/",
      })
      res.setHeader("Set-Cookie", cookie)
    } else {
      const cookie = serialize("user_id", "", {
        maxAge: -1,
        path: "/",
      })
      res.setHeader("Set-Cookie", cookie)
    }

    res.status(200).json({ message: "Successful updating cookie" })
  }
}
