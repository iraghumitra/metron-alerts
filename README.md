# MetronAlerts

This module provides a UI for viewing, searching and acting on alerts.

## Prerequisites

The following services need to be running:

* [Quick Dev](../../metron-deployment/vagrant/quick-dev-platform)
* [metron-rest](../metron-rest) running locally or on quick dev, configured for quick dev environment
* npm (version 3.8.9+)

## Intallation

Build Metron with Maven and then compile the metron-alerts project:
```
mvn clean package -DskipTests
cd incubator-metron/metron-interface/metron-alerts
npm install
```


Then start the application with:
```
./scripts/start_dev.sh
```

## Usage

The application is available on http://localhost:4200.  You must login to the REST API first (credentials= user/password) by navigating to http://localhost:8080/swagger-ui.html#/.   
