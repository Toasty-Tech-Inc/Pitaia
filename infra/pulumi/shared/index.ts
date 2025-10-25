import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
// ou @pulumi/gcp, @pulumi/azure

export interface InfraConfig {
  environment: string;
  region: string;
  projectName: string;
}

export class DatabaseStack {
  public readonly db: aws.rds.Instance;
  
  constructor(name: string, config: InfraConfig) {
    // PostgreSQL RDS
    this.db = new aws.rds.Instance(`${name}-postgres`, {
      engine: 'postgres',
      engineVersion: '15.3',
      instanceClass: config.environment === 'prod' ? 'db.t3.medium' : 'db.t3.micro',
      allocatedStorage: 20,
      dbName: 'pitaia',
      username: 'admin',
      password: pulumi.secret('change-me-in-config'),
      skipFinalSnapshot: config.environment !== 'prod',
    });
  }
}

export class CacheStack {
  public readonly redis: aws.elasticache.Cluster;
  
  constructor(name: string, config: InfraConfig) {
    this.redis = new aws.elasticache.Cluster(`${name}-redis`, {
      engine: 'redis',
      nodeType: config.environment === 'prod' ? 'cache.t3.medium' : 'cache.t3.micro',
      numCacheNodes: 1,
      parameterGroupName: 'default.redis7',
    });
  }
}

export class QueueStack {
  public readonly rabbitmq: aws.mq.Broker;
  
  constructor(name: string, config: InfraConfig) {
    this.rabbitmq = new aws.mq.Broker(`${name}-rabbitmq`, {
      engineType: 'RabbitMQ',
      engineVersion: '3.11',
      hostInstanceType: config.environment === 'prod' ? 'mq.t3.medium' : 'mq.t3.micro',
      users: [{
        username: 'admin',
        password: pulumi.secret('change-me-in-config'),
      }],
    });
  }
}
