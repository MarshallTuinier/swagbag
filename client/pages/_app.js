import App, { Container } from "next/app";
import { ApolloProvider } from "react-apollo";
import Page from "../components/Page";
import withData from "../lib/withData";

class MyApp extends App {
  // We need to expose any data initially to get SSR to work with Apollo
  // This method acheives that

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    // Expose the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render() {
    const { Component, apollo, pageProps } = this.props;

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withData(MyApp);
