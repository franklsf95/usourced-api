import Airtable from "airtable";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { isAuthenticated, isAuthorized } from "./auth";
import { handleError } from "./res_utils";

admin.initializeApp();

const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.get(
  "/projects",
  isAuthenticated,
  isAuthorized,
  async (req: Request, res: Response) => {
    try {
      Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
      const airbase = Airtable.base(process.env.AIRTABLE_BASE_ID!);
      const projectsTable = airbase.table("Projects");
      // TODO(@lsf): select only the records that match the user's linkedCompanyies.id
      const records = await projectsTable.select().all();
      const projects = records.map((record: any) => {
        return {
          id: record.id,
          clientEmail: record.get("Client Email")[0],
          createdTime: new Date(record.get("Created Time")),
          estimatedDeliveryDate: new Date(
            record.get("Estimated Delivery Date"),
          ),
          inquiryDate: new Date(record.get("Inquiry Date")),
          projectImage: record.get("Project Image")[0]["url"],
          projectName: record.get("Project Name"),
          quantity: record.get("Quantity"),
          shipDate: new Date(record.get("Ship Date")),
          shippingMethod: record.get("Shipping Method"),
          shippingStatus: record.get("Shipping Status"),
          status: record.get("Project Status"),
          targetProductionCompletionDate: new Date(
            record.get("Target Production Completion Date"),
          ),
          targetSampleCompletionDate: new Date(
            record.get("Target Sample Completion Date"),
          ),
          unitPrice: record.get("Unit Price"),
        };
      });
      return res.send({ projects });
    } catch (err) {
      return handleError(res, err);
    }
  },
);

export const api = functions
  .runWith({ secrets: ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"] })
  .https.onRequest(app);
