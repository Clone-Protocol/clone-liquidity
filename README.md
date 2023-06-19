This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

### Installing the Incept SDK 
In the `package.json` file under `devDependencies`, you will need to change the path pointed to by `"incept-protocol-sdk"` to your location of the `incept-protocol` repository. Make sure to repull the changes on it regularly and rerun `npm install`.

The setup above is most fitting for local development, but is not suited for deployment. Instead you should use git+ssh. Rather than your local path, replace with `"incept-protocol-sdk": "git+ssh://git@github.com:Incept-Protocol/incept-protocol.git#develop"`. This should install the library from the git repository, it does require the system installing it to have ssh access to `incept-protocol`.

### Switching Networks

In the `.env.local` file you can set the `NEXT_PUBLIC_USE_NETWORK` variable to either `LOCAL_NET` or `DEV_NET` (will default to `LOCAL_NET`). This will switch the network endpoint and program IDs to the default values defined in `sdk/src/network.ts`.

You may also override these values by setting the `NEXT_PUBLIC_CLONE_PROGRAM_ID` and `NEXT_PUBLIC_NETWORK_ENDPOINT` variables.

Keep in mind the variables are loaded at startup and will not change until you restart the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
