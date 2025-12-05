import getClient from "@/app/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { name, pax, contact, email } = await request.json();

    console.log("API Triggered with Data:", { name, pax, contact, email });
    console.log(
      "Environment Check - MONGODB_DB:",
      process.env.MONGODB_DB ? "SET" : "NOT SET"
    );
    console.log(
      "Environment Check - MONGODB_URI:",
      process.env.MONGODB_URI ? "SET" : "NOT SET"
    );

    // Validate required environment variables
    if (!process.env.MONGODB_DB) {
      console.error("CRITICAL: Missing MONGODB_DB environment variable");
      return Response.json(
        { message: "Server configuration error: Missing MONGODB_DB." },
        { status: 500 }
      );
    }

    if (!process.env.MONGODB_URI) {
      console.error("CRITICAL: Missing MONGODB_URI environment variable");
      return Response.json(
        { message: "Server configuration error: Missing MONGODB_URI." },
        { status: 500 }
      );
    }

    try {
      console.log("Attempting to connect to MongoDB...");
      const client = await getClient();
      console.log("MongoDB connection successful");
      const db = client.db(process.env.MONGODB_DB);
      console.log("Database selected:", process.env.MONGODB_DB);

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
      console.error("MongoDB Error Details:", {
        message: dbError.message,
        code: dbError.code,
        name: dbError.name,
        stack: dbError.stack,
      });
      return Response.json(
        {
          message: "Failed to save registration data. Please try again.",
          error: dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("API ERROR:", error);
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }
}
