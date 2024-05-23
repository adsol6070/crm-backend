import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  try {
    await knex.schema.createTable(
      "leads",
      function (table: Knex.CreateTableBuilder) {
        table.uuid("id").primary();
        table.uuid("tenantID").notNullable();
        table.string("firstname").notNullable();
        table.string("lastname").notNullable();
        table.string("email").notNullable().unique();
        table.string("phone").notNullable();
        table.string("gender");
        table.date("dob");
        table.string("nationality");
        table.string("maritalStatus");
        table.string("passportNumber");
        table.date("passportExpiry");
        table.string("currentAddress");
        table.string("permanentAddress");
        table.string("highestQualification");
        table.string("fieldOfStudy");
        table.string("institutionName");
        table.string("graduationYear");
        table.string("grade");
        table.string("testType");
        table.string("testScore");
        table.string("countryOfInterest");
        table.string("courseOfInterest");
        table.string("desiredFieldOfStudy");
        table.string("preferredInstitutions");
        table.string("intakeSession");
        table.string("reasonForImmigration");
        table.string("financialSupport");
        table.string("sponsorDetails");
        table.string("proofOfFunds");
        table.string("scholarships");
        table.string("previousVisaApplications");
        table.string("previousStudyAbroad");
        table.string("visaType");
        table.date("visaExpiryDate");
        table.string("resume");
        table.string("recommendationLetter");
        table.string("sop");
        table.string("transcripts");
        table.string("certificates");
        table.string("passportCopy");
        table.string("languageTestReport");
        table.string("communicationMode");
        table.string("preferredContactTime");
        table.text("notes");
        table.string("leadSource");
        table.string("referralContact");
        table.string("leadStatus");
        table.string("assignedAgent");
        table.date("followUpDates");
        table.string("leadRating");
        table.text("leadNotes");
        table.timestamps(true, true);
      },
    );
  } catch (error) {
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.dropTable("leads");
  } catch (error) {
    throw error;
  }
}
