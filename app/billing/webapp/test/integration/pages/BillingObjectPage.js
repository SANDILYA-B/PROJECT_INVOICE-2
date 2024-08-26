sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.satinfotech.cloudapps.billing',
            componentId: 'BillingObjectPage',
            contextPath: '/Billing'
        },
        CustomPageDefinitions
    );
});