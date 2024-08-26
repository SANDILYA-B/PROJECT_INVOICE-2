sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/satinfotech/cloudapps/billing/test/integration/FirstJourney',
		'com/satinfotech/cloudapps/billing/test/integration/pages/BillingList',
		'com/satinfotech/cloudapps/billing/test/integration/pages/BillingObjectPage',
		'com/satinfotech/cloudapps/billing/test/integration/pages/BillingItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, BillingList, BillingObjectPage, BillingItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/satinfotech/cloudapps/billing') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBillingList: BillingList,
					onTheBillingObjectPage: BillingObjectPage,
					onTheBillingItemsObjectPage: BillingItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);