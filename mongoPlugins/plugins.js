import { tenantStorage } from '../context/tenantStorage';

function auditPlugin(schema) {

    const operations = [ 
        'find', 
        'findOne', 
        'updateMany', 
        'deleteMany', 
        'findOneAndDelete', 
        'findOneAndReplace', 
        'findOneAndUpdate', 
        'updateOne', 
        'deleteOne',
        'countDocuments',
    ]

    schema.pre('save', function(next) {
        if (this.getOptions().skipTenant) return next();

        const localStore = tenantStorage.getStore();

        if (!localStore || !localStore.companyId) return next(new Error('Tenant context missing'));

        this.companyId = localStore.companyId;
        next();
    });

    schema.pre('aggregate', function(next) {
        if (this.getOptions().skipTenant) return next();

        const localStore = tenantStorage.getStore();

        if (!localStore || !localStore.companyId) return next(new Error('Tenant context missing'));
        
        this.pipeline().unshift({ $match: { companyId: localStore.companyId }});
        next();
    });

    
    operations.forEach(op => {
        schema.pre(op, function(next) {
            const reqQuery = this.getFilter();
            const localStore = tenantStorage.getStore();

            if (this.getOptions().skipTenant) return next();
            if (!localStore || !localStore.companyId) return next(new Error('Tenant context missing'));

            this.setQuery({...reqQuery, companyId: localStore.companyId});

            next();
        });
    });
};

export {
    auditPlugin
}