// SPDX-License-Identifier: MIT
// The catalogue: every topic and indicator Lontar publishes, with plain-language definitions.

// better: 1 = a rise is an improvement, -1 = a fall is, 0 = neither. asean: neighbour series are shipped.
const entry = (id, code, name, unit, better, asean, definition) => ({ id, code, name, unit, better, asean, definition });

export const TOPICS = [
  {
    id: 'people', name: 'People', lead: 'population',
    blurb: 'How many people live in Indonesia, where they live and how old they are.',
    indicators: [
      entry('population', 'SP.POP.TOTL', 'Population', 'people', 0, true, 'Everyone living in the country at mid-year, whatever their citizenship.'),
      entry('population-growth', 'SP.POP.GROW', 'Population growth', '% a year', 0, true, 'How much larger the population is than a year earlier.'),
      entry('urban-share', 'SP.URB.TOTL.IN.ZS', 'People living in towns and cities', '% of population', 0, true, 'Share of residents in areas that national statistics classify as urban.'),
      entry('fertility', 'SP.DYN.TFRT.IN', 'Fertility rate', 'births per woman', 0, true, 'Children a woman would have if she lived through her childbearing years at today’s birth rates.'),
      entry('children-share', 'SP.POP.0014.TO.ZS', 'Children aged 0 to 14', '% of population', 0, false, 'Share of the population that has not yet turned 15.'),
      entry('older-share', 'SP.POP.65UP.TO.ZS', 'People aged 65 and over', '% of population', 0, true, 'Share of the population aged 65 or older.'),
      entry('dependency', 'SP.POP.DPND', 'Age dependency ratio', 'per 100 working-age', 0, false, 'Children and older people for every 100 people aged 15 to 64.'),
      entry('density', 'EN.POP.DNST', 'Population density', 'people per km²', 0, false, 'Residents for each square kilometre of land.'),
    ],
  },
  {
    id: 'economy', name: 'Economy', lead: 'gdp-growth',
    blurb: 'What the country produces, what it trades and how fast prices rise.',
    indicators: [
      entry('gdp', 'NY.GDP.MKTP.CD', 'Gross domestic product', 'US$', 1, true, 'Value of all goods and services produced in a year, at that year’s prices and exchange rate.'),
      entry('gdp-growth', 'NY.GDP.MKTP.KD.ZG', 'Real economic growth', '% a year', 1, true, 'Change in output after removing the effect of price rises.'),
      entry('gdp-per-person', 'NY.GDP.PCAP.CD', 'GDP per person', 'US$', 1, true, 'Output divided by the number of residents. It is an average, not a typical income.'),
      entry('gdp-per-person-ppp', 'NY.GDP.PCAP.PP.CD', 'GDP per person, purchasing power', 'international $', 1, true, 'GDP per person adjusted so that one dollar buys the same basket in every country.'),
      entry('inflation', 'FP.CPI.TOTL.ZG', 'Consumer price inflation', '% a year', -1, true, 'How much more a typical household basket costs than a year earlier. Very low or negative values also deserve attention.'),
      entry('exports', 'NE.EXP.GNFS.ZS', 'Exports of goods and services', '% of GDP', 0, true, 'Value of everything sold abroad, compared with the size of the economy.'),
      entry('imports', 'NE.IMP.GNFS.ZS', 'Imports of goods and services', '% of GDP', 0, false, 'Value of everything bought from abroad, compared with the size of the economy.'),
      entry('investment-inflow', 'BX.KLT.DINV.WD.GD.ZS', 'Foreign direct investment, net inflows', '% of GDP', 0, true, 'Long-term investment by foreigners into Indonesian businesses, less what they withdraw.'),
      entry('manufacturing', 'NV.IND.MANF.ZS', 'Manufacturing', '% of GDP', 0, true, 'Share of output that comes from factories and processing.'),
      entry('agriculture', 'NV.AGR.TOTL.ZS', 'Agriculture, forestry and fishing', '% of GDP', 0, false, 'Share of output that comes from farms, forests and fisheries.'),
    ],
  },
  {
    id: 'work', name: 'Work and poverty', lead: 'unemployment',
    blurb: 'Who has a job, who is looking for one and how many households are poor.',
    indicators: [
      entry('unemployment', 'SL.UEM.TOTL.ZS', 'Unemployment rate', '% of labour force', -1, true, 'People without work who are looking and ready to start, as a share of the labour force. Modelled ILO estimate.'),
      entry('youth-unemployment', 'SL.UEM.1524.ZS', 'Youth unemployment, ages 15 to 24', '% of youth labour force', -1, true, 'The same measure for young people only. Modelled ILO estimate.'),
      entry('participation', 'SL.TLF.CACT.ZS', 'Labour force participation', '% of people 15+', 0, true, 'Share of people aged 15 and over who work or are looking for work. Modelled ILO estimate.'),
      entry('female-participation', 'SL.TLF.CACT.FE.ZS', 'Women in the labour force', '% of women 15+', 1, true, 'Share of women aged 15 and over who work or are looking for work. Modelled ILO estimate.'),
      entry('farm-jobs', 'SL.AGR.EMPL.ZS', 'Jobs in agriculture', '% of employment', 0, false, 'Share of all workers whose main job is in farming, forestry or fishing. Modelled ILO estimate.'),
      entry('poverty', 'SI.POV.NAHC', 'Poverty at the national line', '% of population', -1, false, 'Share of people living below the poverty line that Indonesia sets for itself. National lines differ between countries.'),
      entry('extreme-poverty', 'SI.POV.DDAY', 'Poverty at the international line', '% of population', -1, true, 'Share of people below the World Bank’s lowest international poverty line, in purchasing-power dollars.'),
      entry('gini', 'SI.POV.GINI', 'Inequality (Gini index)', 'index, 0 to 100', -1, false, 'How unevenly consumption or income is shared: 0 means everyone has the same, 100 means one person has all.'),
    ],
  },
  {
    id: 'health', name: 'Health', lead: 'life-expectancy',
    blurb: 'How long people live, how safe birth and childhood are and what care costs.',
    indicators: [
      entry('life-expectancy', 'SP.DYN.LE00.IN', 'Life expectancy at birth', 'years', 1, true, 'Years a newborn would live if today’s death rates stayed the same for life.'),
      entry('child-mortality', 'SH.DYN.MORT', 'Deaths before age five', 'per 1,000 births', -1, true, 'Chance that a newborn dies before turning five, per 1,000 live births.'),
      entry('infant-mortality', 'SP.DYN.IMRT.IN', 'Deaths before age one', 'per 1,000 births', -1, false, 'Infants who die before their first birthday, per 1,000 live births.'),
      entry('maternal-mortality', 'SH.STA.MMRT', 'Maternal mortality', 'per 100,000 births', -1, true, 'Women who die from causes linked to pregnancy or childbirth, per 100,000 live births. Modelled estimate.'),
      entry('stunting', 'SH.STA.STNT.ZS', 'Stunting in young children', '% of under-fives', -1, false, 'Children under five who are much shorter than expected for their age, a sign of long-term undernutrition. Survey years only.'),
      entry('measles-vaccine', 'SH.IMM.MEAS', 'Measles vaccination', '% of ages 12–23 months', 1, true, 'Young children who have received a measles vaccine.'),
      entry('tuberculosis', 'SH.TBS.INCD', 'Tuberculosis incidence', 'per 100,000 people', -1, false, 'New and relapse tuberculosis cases estimated in a year.'),
      entry('health-spending', 'SH.XPD.CHEX.GD.ZS', 'Health spending', '% of GDP', 0, true, 'Current spending on health by government, insurers and households.'),
    ],
  },
  {
    id: 'education', name: 'Education', lead: 'secondary-enrolment',
    blurb: 'Who is enrolled at each level of school and what the state spends on it.',
    indicators: [
      entry('primary-enrolment', 'SE.PRM.ENRR', 'Primary school enrolment', '% gross', 0, false, 'Pupils in primary school of any age, per 100 children of primary age. It can pass 100.'),
      entry('secondary-enrolment', 'SE.SEC.ENRR', 'Secondary school enrolment', '% gross', 1, true, 'Pupils in secondary school of any age, per 100 people of secondary age.'),
      entry('tertiary-enrolment', 'SE.TER.ENRR', 'Higher education enrolment', '% gross', 1, true, 'Students in colleges and universities, per 100 people in the five years after school age.'),
      entry('primary-completion', 'SE.PRM.CMPT.ZS', 'Primary school completion', '% of age group', 1, false, 'New finishers of the last primary grade, compared with children of the age to finish. It can pass 100.'),
      entry('literacy', 'SE.ADT.LITR.ZS', 'Adult literacy', '% of people 15+', 1, true, 'People aged 15 and over who can read and write a short statement about daily life.'),
      entry('education-spending', 'SE.XPD.TOTL.GD.ZS', 'Government education spending', '% of GDP', 0, true, 'Public spending on schools, colleges and training, compared with the size of the economy.'),
    ],
  },
  {
    id: 'environment', name: 'Environment and energy', lead: 'renewable-energy',
    blurb: 'Power, cooking fuel, water, forests and carbon.',
    indicators: [
      entry('electricity-access', 'EG.ELC.ACCS.ZS', 'Access to electricity', '% of population', 1, true, 'People whose home has an electricity supply.'),
      entry('clean-cooking', 'EG.CFT.ACCS.ZS', 'Clean cooking fuels', '% of population', 1, false, 'People who mainly cook with fuels and stoves that give off little indoor smoke.'),
      entry('basic-water', 'SH.H2O.BASW.ZS', 'Basic drinking water', '% of population', 1, false, 'People using an improved water source within a 30 minute round trip.'),
      entry('renewable-energy', 'EG.FEC.RNEW.ZS', 'Renewable energy share', '% of final energy', 1, true, 'Share of the energy used by homes, industry and transport that comes from renewable sources.'),
      entry('energy-use', 'EG.USE.PCAP.KG.OE', 'Energy use per person', 'kg of oil equivalent', 0, false, 'All primary energy used in a year, divided by the population.'),
      entry('co2-per-person', 'EN.GHG.CO2.PC.CE.AR5', 'Carbon dioxide per person', 't CO₂e', -1, true, 'Carbon dioxide emitted per resident, excluding land use change and forestry.'),
      entry('forest-area', 'AG.LND.FRST.ZS', 'Forest area', '% of land', 1, true, 'Land under natural or planted stands of trees, not counting farm orchards.'),
    ],
  },
  {
    id: 'digital', name: 'Digital and infrastructure', lead: 'internet-users',
    blurb: 'Connections, transport and the basics that homes depend on.',
    indicators: [
      entry('internet-users', 'IT.NET.USER.ZS', 'People using the internet', '% of population', 1, true, 'Individuals who used the internet from anywhere in the last three months.'),
      entry('mobile-subscriptions', 'IT.CEL.SETS.P2', 'Mobile phone subscriptions', 'per 100 people', 0, true, 'Active mobile subscriptions. One person may hold several, so it can pass 100.'),
      entry('broadband', 'IT.NET.BBND.P2', 'Fixed broadband subscriptions', 'per 100 people', 1, true, 'Wired high-speed internet subscriptions.'),
      entry('sanitation', 'SH.STA.BASS.ZS', 'Basic sanitation', '% of population', 1, false, 'People using an improved toilet that their household does not share.'),
      entry('air-passengers', 'IS.AIR.PSGR', 'Air passengers carried', 'passengers', 0, false, 'Passengers flown on domestic and international trips by airlines registered in the country.'),
      entry('container-traffic', 'IS.SHP.GOOD.TU', 'Container port traffic', '20-foot units', 0, false, 'Containers handled at ports, counted in twenty-foot equivalent units.'),
    ],
  },
];

export const INDICATORS = TOPICS.flatMap((topic) => topic.indicators.map((i) => ({ ...i, topic: topic.id })));
export const indicatorById = (id) => INDICATORS.find((i) => i.id === id);
export const topicById = (id) => TOPICS.find((t) => t.id === id);

export const HOME = 'IDN';
export const COUNTRIES = {
  IDN: 'Indonesia', BRN: 'Brunei', KHM: 'Cambodia', LAO: 'Laos', MYS: 'Malaysia', MMR: 'Myanmar',
  PHL: 'Philippines', SGP: 'Singapore', THA: 'Thailand', TLS: 'Timor-Leste', VNM: 'Viet Nam',
};
