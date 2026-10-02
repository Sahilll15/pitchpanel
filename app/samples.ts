export type Sample = { label: string; title: string; pitch: string };

export const SAMPLES: Sample[] = [
  {
    label: 'Grid software, strong',
    title: 'Interlink',
    pitch: `Interlink helps solar and battery developers get connected to the power grid faster.

Today a new project waits 4 to 5 years in a utility interconnection queue, and most of that time goes to engineering studies that utilities run by hand in spreadsheets and legacy power flow tools. We automate those studies. Utilities upload their grid model, developers submit projects, and Interlink runs the load flow and cost allocation in hours instead of months.

Why now: FERC Order 2023 forces every US utility to move to cluster studies with hard deadlines and penalties starting in 2025. Utilities have to change how they work this year, and their staff cannot keep up.

Team: Maya was a transmission planning engineer at PG&E for 8 years and ran its queue reform. Dev led the simulation team at a grid software company acquired by Siemens.

Traction: 3 utilities live under paid contracts, $540k ARR, 2 more in procurement. Studies that took 9 months now take 3 weeks. Contracts are 3 year SaaS deals priced per study plus a platform fee, at 82% gross margin.

Competition is consultants like Burns & McDonnell and in-house teams. Each utility we onboard adds its grid model to our dataset, which makes our study results more accurate for the next one.

We are raising a $6M seed to hire 8 engineers and reach 12 utilities by end of next year.`,
  },
  {
    label: 'Dog walking app, rough',
    title: 'PawPal',
    pitch: `PawPal is Uber for dog walking but powered by AI. Everyone with a dog needs this. The pet market is $300 billion so even 1% is a huge business. Our AI matches dogs with the perfect walker and will change how the world thinks about pets. We are passionate dog lovers and plan to launch soon in every major city at once. We will make money through ads and maybe subscriptions later.`,
  },
  {
    label: 'One-liner, mid',
    title: 'Shelfie',
    pitch: `Shelfie is a shelf scanning app for independent grocery stores: a clerk walks the aisles with a phone, and we flag out of stock items and suggest reorders. 40 stores in Ohio use the free beta and 6 pay $149 a month.`,
  },
];
