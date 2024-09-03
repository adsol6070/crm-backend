import { Knex } from "knex";

const getCardsData = async (connection: Knex): Promise<any> => {
  const leadData: any = await connection("leads")
    .count("* as count")
    .first();

    const blogData: any = await connection("blogs")
    .count("* as count")
    .first();

    const userData: any = await connection("users")
    .count("* as count")
    .first();

    const calculatedData: any = await connection("CRSscores")
    .count("* as count")
    .first();

    const cardsData = {
      leadsCount: parseInt(leadData.count),
      blogsCount: parseInt(blogData.count),
      usersCount: parseInt(userData.count),
      scoresCount: parseInt(calculatedData.count),
    }
    return cardsData;
}

const getLeadsBasedonStatus = async (connection: Knex): Promise<any> => {
  const cteQuery = connection
    .with('all_leads', (qb) => {
      qb.select('*').from('leads');
    })
    .select('leadStatus as status', connection.raw('COUNT(*) as lead_count'))
    .from('all_leads')
    .groupBy('leadStatus')
    .orderBy('leadStatus');

  return await cteQuery;
};

const getCreatedLeadsBasedOnTime = async (connection: any, startDate: any, endDate: any) => {

  const leadReportsOnTime = await connection('leads')
    .whereBetween('created_at', [startDate, endDate])
    .select(
      connection.raw(`created_at AT TIME ZONE 'UTC' AS date`), 
      connection.raw('COUNT(*) as lead_count')
    )
    .groupBy('date')
    .orderBy('date');

  return leadReportsOnTime;
};

const getCreatedLeadsBasedOnSource = async (connection: Knex): Promise<any> => {
  const cteQuery = connection
    .with('all_leads', (qb) => {
      qb.select('*').from('leads');
    })
    .select('leadSource as source', connection.raw('COUNT(*) as lead_count'))
    .from('all_leads')
    .groupBy('leadSource')
    .orderBy('leadSource');

  return await cteQuery;
};

export default {
  getCardsData,
  getLeadsBasedonStatus,
  getCreatedLeadsBasedOnTime,
  getCreatedLeadsBasedOnSource,
};
