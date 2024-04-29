import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  return currentUser ? <h1>You are signed in</h1> : <h1>Landing Page</h1>;
};

LandingPage.getInitialProps = async (context) => {
  try {
    const client = buildClient(context);
    const { data } = await client.get("/api/users/currentuser");

    return data;
  } catch (e) {
    throw e;
  }
};

export default LandingPage;
