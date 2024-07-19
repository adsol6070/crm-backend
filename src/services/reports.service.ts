import { Knex } from "knex";

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

const getCreatedLeadsBasedOnTime = async (connection: any, startDate: Date, endDate: Date) => {
  return connection('leads')
      .whereBetween('created_at', [startDate, endDate])
      .select(connection.raw('DATE(created_at) as date'), connection.raw('COUNT(*) as lead_count'))
      .groupBy('date')
      .orderBy('date');
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
  getLeadsBasedonStatus,
  getCreatedLeadsBasedOnTime,
  getCreatedLeadsBasedOnSource,
};
