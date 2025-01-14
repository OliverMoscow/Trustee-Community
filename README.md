# Trustee Community

#### Check out the wiki for sequence diagram and more https://github.com/HIEofOne/Trustee-Community/wiki 

Trustee Community is the code repository a community manager can fork to create a new patient community.

To create a new patient community, a manger will need these four things:
- An account at DigtialOcean to pay for hosting the community members Trustees (patient-controlled health records),
- An account at Stripe to collect credit card payments for Trustee subscriptions hosted by the community,
- A domain name for the community,
- A privacy policy describing the initial configuration of Trustee access policies and how subscribers can change the policies if they choose.# Getting Started

## Installation
#### 1. Gather all API keys for Magic, USPSTF, UMLS, DigitalOcean, and SendGrid
- have these ready for the installer in step 4
- details on getting API keys are in the section [More on Additional API Services](#more-on-additional-api-services)
- assume you have a domain name (mydomain.xyz) and email address needed for LetsEncrypt SSL (my@email.xyz)
#### 2. Create a DigitalOcean Droplet with the minimum parameters:
- size: 's-1vcpu-1gb',
- image: 'ubuntu-22-10-x64'
#### 3. Login to the console (should be root user) and enter this command:
```
git clone -b deploy --single-branch https://github.com/HIEofOne/Trustee-Community.git
cd Trustee-Community
./do-install.sh
```
#### 4. The first pass will install all dependencies.  Logout and login to the droplet.
```
exit
cd Trustee-Community
./do-install.sh
```
#### 5. Open your browser to https://mydomain.xyz
- Other notable endpoints with your Trustee include:
- https://db.mydomain.xyz which points to the [CouchDB](https://couchdb.apache.org/) database used to store user account information (just email) and droplet info.
- https://router.mydomain.xyz which points to the [Traefik](https://doc.traefik.io/traefik/providers/docker/) reverse proxy router

## More on Additional API Services
### [Magic](https://magic.link/) instructions:
#### 1. Set up an account for free by visiting [Magic](https://magic.link).  Click on Start now.
#### 2. Once you are in the [dashboard](https://dashboard.magic.link/app/all_apps), go to Magic Auth and click on New App.  Enter the App Name (My App Powered by Trustee) and hit Create App.
#### 3. Once you are in the home page for the app, scroll down to API Keys and copy the PUBISHABLE API KEY value.  This API Key will be usee to interact with Magic's APIs
### [National Library of Medicine UMLS Terminology Services](https://uts.nlm.nih.gov/uts/) - this is to allow search queries for SNOMED CT LOINC, and RXNorm definitions.
#### 1. Set up an account [here](https://uts.nlm.nih.gov/uts/signup-login)
#### 2. [Edit your profile](https://uts.nlm.nih.gov/uts/edit-profile) and click on Generate new API Key.  Copy this API key.
### [US Preventive Services Task Force](https://www.uspreventiveservicestaskforce.org/apps/api.jsp) - this provides Care Opportunties guidance based on USPSTF guidelines
#### 1. [Visit this site for instructions](https://www.uspreventiveservicestaskforce.org/apps/api.jsp)

## Architecture
Trustee is based around Docker containers.  This repository source code is for the Trustee core which is Next.JS based application and served by Node.JS.  Deployment of individual Docker containers which includes the patient health record powered by [NOSH](https://github.com/shihjay2/nosh3) specific to only one patient/user is demonstrated by this project.

The docker-compose.yml (template found in docker-compose.tmp under the docker directory) defines the specific containers that when working together, allow Trustee to be able to fully featured (e.g. a bundle).  Below are the different containers and what they do:
#### 1. [Traefik](https://doc.traefik.io/traefik/providers/docker/) - this is the router, specifying the ports and routing to the containers in the bundle 
#### 2. [CouchDB](https://couchdb.apache.org/) - this is the NoSQL database that stores all documents
#### 3. [NOSH](https://github.com/shihjay2/nosh3) - this is the Node.js based server application
#### 4. [Watchtower](https://github.com/containrrr/watchtower) - this service pulls and applies updates to all Docker Images in the bundle automatically without manager intervention

## Developer API

Get all patients
```
GET /api/couchdb/patients/all
```

Get all rs requests
```
GET /api/couchdb/requests/all
```

