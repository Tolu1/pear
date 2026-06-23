export interface PlaygroundScenario {
  id: string;
  label: string;
  description: string;
  targetUrl: string;
  goal: string;
}

export const SCENARIOS: PlaygroundScenario[] = [
  {
    id: "google-search",
    label: "Search Google",
    description: "Runs a simple search and opens a result.",
    targetUrl: "https://www.google.com",
    goal: 'Search Google for "wireless noise cancelling headphones" and open the first organic (non-ad) result.',
  },
  {
    id: "wikipedia-lookup",
    label: "Look something up on Wikipedia",
    description: "Searches for an article and opens it.",
    targetUrl: "https://www.wikipedia.org",
    goal: 'Search Wikipedia for "Ada Lovelace" and open her article page.',
  },
  {
    id: "add-to-cart",
    label: "Add an item to a cart",
    description: "Logs into a demo store and adds a product to the cart.",
    targetUrl: "https://www.saucedemo.com",
    goal: 'Log in with username "standard_user" and password "secret_sauce". Then add the "Sauce Labs Backpack" to the cart and open the cart page.',
  },
  {
    id: "fill-checkout",
    label: "Fill out a checkout form",
    description: "Drives a demo store all the way to the checkout overview.",
    targetUrl: "https://www.saucedemo.com",
    goal: 'Log in with username "standard_user" and password "secret_sauce". Add the "Sauce Labs Backpack" to the cart, open the cart, click Checkout, fill the form with First Name "Pear", Last Name "Tester" and Zip Code "12345", then continue to the order overview.',
  },
  {
    id: "browse-and-back",
    label: "Open a product, then go back",
    description: "Exercises navigation and back-navigation.",
    targetUrl: "https://www.producthunt.com",
    goal: "Open the #1 product on Product Hunt today, wait for it to load, then navigate back to the homepage.",
  },
];
