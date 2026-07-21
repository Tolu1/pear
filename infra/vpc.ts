// ec2 NAT gives Fargate outbound internet to reach the Anthropic API, and is cheaper than a managed NAT gateway.
export const vpc = new sst.aws.Vpc("Vpc", { nat: "ec2" });
