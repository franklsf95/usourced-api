import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import admin from "firebase-admin";
import * as functions from "firebase-functions";

import { isAuthenticated } from "./auth.js";
import { handleError } from "./res_utils.js";

admin.initializeApp();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));

const AIRTABLE_API_URL = "https://api.airtable.com/v0";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = "appcJSlNIJ6uYs6hY";
const PROJECTS_TABLE_ID = "tblalL0HVWCQfXVh1";

function makeFilter(linkedCompanies: string[]): string {
  return (
    "OR(" +
    linkedCompanies
      .map((id) => `FIND("${id}", ARRAYJOIN({ClientID}, ","))`)
      .join(",") +
    ")"
  );
}

app.get("/projects", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const linkedCompanies = res.locals.linkedCompanies;
    if (!linkedCompanies) {
      return res.status(204).send(); // No Content
    }
    const filterStr = makeFilter(linkedCompanies);
    const resp = await axios.get(
      `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${PROJECTS_TABLE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        params: {
          filterByFormula: filterStr,
          returnFieldsByFieldId: true,
          pageSize: 10,
        },
      },
    );
    const records = resp.data.records;
    const projects = records.map((record: any) => {
      return {
        id: record.id,
        createdTime: new Date(record.createdTime),
        inquiryDate: new Date(record.fields["fldfHd0okvI0ic8wP"]),
        projectImage:
          "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
        projectName: record.fields["fldhANhhyIK0Na0cZ"],
        status: record.fields["fldNJ9qr2UePvmKOP"],
      };
    });
    return res.send({ projects });
  } catch (err) {
    return handleError(res, err);
  }
});

app.post("/projects", isAuthenticated, async (req: Request, res: Response) => {
  try {
    // // make a new record in the projects table
    // const airbase = Airtable.base(process.env.AIRTABLE_BASE_ID!);
    // const projectsTable = airbase.table("Projects");
    // const newRecord = await projectsTable.create({
    //   "Client Email": req.body.clientEmail,
    //   // "Created Time": new Date(),
    // });
    return res.send({});
  } catch (err) {
    return handleError(res, err);
  }
});

export const api = functions
  .runWith({ secrets: ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"] })
  .https.onRequest(app);
