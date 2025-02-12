import { testClient } from "hono/testing";
import { app as mainApp } from "../src";

export const app = testClient(mainApp);
