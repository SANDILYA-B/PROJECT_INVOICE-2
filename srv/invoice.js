const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");

module.exports = cds.service.impl(async function () {
  const billingService = await cds.connect.to("API_BILLING_DOCUMENT_SRV");

  let fetchStatus = {
    messages: ["Initialization in progress..."], 
    completed: false
  };

  async function fetchAndUpsertBillingData() {
    try {
      const { Billing, BillingItems } = this.entities;

      const existingBillDocs = await cds.run(
        SELECT.from(Billing).columns(["BillingDocument"])
      );
      const existingBillItems = await cds.run(
        SELECT.from(BillingItems).columns([
          "BillingDocument",
          "BillingDocumentItem",
        ])
      );

      const existingDocsMap = new Map(
        existingBillDocs.map((doc) => [doc.BillingDocument, doc])
      );
      const existingItemsMap = new Map(
        existingBillItems.map(
          (item) => [`${item.BillingDocument}-${item.BillingDocumentItem}`, item]
        )
      );

      const lastSyncDate = await cds.run(
        SELECT.one.from(Billing)
          .columns("LastChangeDateTime")
          .orderBy("LastChangeDateTime desc")
      );

      let lastSyncDateTime;
      if (lastSyncDate) {
        lastSyncDateTime = lastSyncDate.LastChangeDateTime;
      }

      let documentCount;
      let billQuery = SELECT.from("API_BILLING_DOCUMENT_SRV.A_BillingDocument").columns([
        "BillingDocument",
        "SDDocumentCategory",
        "SalesOrganization",
        "BillingDocumentDate",
        "TotalNetAmount",
        "FiscalYear",
        "CompanyCode",
        "LastChangeDateTime",
      ]);

      if (lastSyncDateTime) {
        documentCount = await billingService.send({
          method: "GET",
          path: `A_BillingDocument/$count?$filter=LastChangeDateTime gt datetimeoffset'${lastSyncDateTime}'`,
        });
        billQuery = billQuery.where({ LastChangeDateTime: { gt: lastSyncDateTime } });
      } else {
        documentCount = await billingService.send({ method: "GET", path: "A_BillingDocument/$count" });
      }

      let batchSize = 50;
      let batchNum = 1;

      for (let i = 0; i < documentCount; i += batchSize) {

        let upperBound = i + batchSize;
        if (upperBound > documentCount) {
          upperBound = documentCount; 
        }

        let billingDocs = await billingService.run(billQuery.limit(batchSize, i));

        fetchStatus.messages.push(`Processing Batch ${batchNum} ( ${i + 1} to ${upperBound} ) of ${documentCount} records`);
        batchNum += 1;
        console.log(fetchStatus.messages[fetchStatus.messages.length - 1]);

        const newBillingDocs = billingDocs.filter(
            (doc) => !existingDocsMap.has(doc.BillingDocument)
        );
        const docsToUpsert = newBillingDocs.map((doc) => ({
            ID: uuidv4(),
            ...doc,
        }));

        if (docsToUpsert.length > 0) {
            await cds.run(UPSERT.into(Billing).entries(docsToUpsert));
        }
      }

      // Fetch new Billing items
      let billingItems = await billingService.run(
        SELECT.from("API_BILLING_DOCUMENT_SRV.A_BillingDocumentItem").columns([
          "BillingDocumentItem",
          "BillingDocumentItemText",
          "BaseUnit",
          "BillingQuantityUnit",
          "Plant",
          "StorageLocation",
          "BillingDocument",
          "NetAmount",
          "TransactionCurrency",
        ])
      );

      const newBillingItems = billingItems.filter(
        (item) =>
          !existingItemsMap.has(
            `${item.BillingDocument}-${item.BillingDocumentItem}`
          )
      );
      const itemsToUpsert = newBillingItems.map((item) => ({
        ID: uuidv4(),
        ...item,
      }));

      if (itemsToUpsert.length > 0) {
        await cds.run(UPSERT.into(BillingItems).entries(itemsToUpsert));
      }

      fetchStatus.messages.push("Billing data fetch completed successfully");
      fetchStatus.completed = true;
    } catch (error) {
      console.error("An error occurred during the operation:", error);
      fetchStatus.messages.push("An error occurred during data fetch");
      fetchStatus.completed = true;
      throw error;  
    }
  }

  this.on("BillingFetch", async (req) => {
    try {
      fetchStatus = { messages: ["Fetch operation starting..."], completed: false }; 
      await fetchAndUpsertBillingData.call(this);
      console.log("Fetch Status", fetchStatus);
      return true;
    } catch (error) {
      console.error("An error occurred during the fetch operation:", error);
      req.error(500, "An error occurred during data fetch operation");
    }
  });

  this.on("Status", async (req) => {
    console.log(fetchStatus);
    return fetchStatus;
  });

});