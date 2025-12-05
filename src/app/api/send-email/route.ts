import getClient from "@/app/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { name, pax, contact, email } = await request.json();

    console.log("API Triggered with Data:", { name, pax, contact, email });

    try {
      const client = await getClient();
      const db = client.db(process.env.MONGODB_DB);

      const result = await db.collection("form_submissions").insertOne({
        name,
        pax,
        contact,
        email,
        submittedAt: new Date(),
      });

      console.log("Form data saved to MongoDB with ID:", result.insertedId);

      return Response.json(
        {
          success: true,
          message: "Registration confirmed. Your data has been saved.",
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.error("MongoDB Save Error:", dbError);
      return Response.json(
        { message: "Failed to save registration data. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("API ERROR:", error);
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }
}
