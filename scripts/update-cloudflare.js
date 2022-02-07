// eslint-disable-next-line
const axios = require('axios');

const updateOrCreateRecord = async (name, type, _payload) => {
  if (!process.env.CF_API_TOKEN || !process.env.CF_ZONE_ID) {
    throw new Error('CF_API_TOKEN or CF_ZONE_ID were not specified');
  }
  const cfClient = axios.create({
    headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` },
    baseURL: `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records`,
  });
  const { data: zoneData } = await cfClient.get('/', {
    params: { name, type },
  });
  const payload = {
    name,
    type,
    ..._payload,
  };
  if (zoneData.success) {
    if (zoneData.result.length) {
      if (zoneData.result.length > 1) {
        throw new Error(`Some inconsistency in ${name} ${type} record`);
      }
      const record = zoneData.result[0];
      const { data: recordUpdateData } = await cfClient.put(`/${record.id}`, payload);
      if (!recordUpdateData.success) {
        throw new Error(
          `${name} ${type} record was not updated with errors: ${recordUpdateData.errors}`
        );
      }
    } else {
      try {
        const { data: recordCreateData } = await cfClient.post(`/`, payload);
        if (!recordCreateData.success) {
          throw new Error(
            `${name} ${type} record was not created with errors: ${recordCreateData.errors}`
          );
        }
      } catch (e) {
        console.log('e', e.response.data.errors[0]);
        throw e;
      }
    }
  } else {
    throw new Error(`request to get ${name} ${type} zone info failed with ${zoneData.errors}`);
  }
};

const updateCloudFlareRecord = async (hash, domain) => {
  console.log(`domain to update - https://${domain}`);

  if (domain != 'app.aave.com') {
    console.log('updating CNAME record');
    await updateOrCreateRecord(domain, 'CNAME', {
      content: `cloudflare-ipfs.com`,
    });
  }

  console.log('updating dns link record');
  await updateOrCreateRecord(`_dnslink.${domain}`, 'TXT', {
    content: `dnslink=/ipfs/${hash}/`,
  });

  console.log('done');
};

const publish = async () => {
  const domain = process.env.CF_DEPLOYMENT_DOMAIN;
  const hash = process.env.HASH;
  if (domain && hash) {
    console.log(`trying to update DNS for ${domain} with ${hash}`);
    await updateCloudFlareRecord(hash, domain);
  } else {
    console.log('no cloudflare domain specified, skipping DNS update');
  }
  process.exit(0);
};

publish();
