# Ecommerce Microservices Platform

🚀 **Live Application:** https://shop.zeroop.dev

This project is a distributed ecommerce platform designed using microservices architecture.
The system supports customers, sellers, and administrators and demonstrates large-scale system design principles.

---

# Documentation

Project documentation is available in the `docs` folder.

* [Functional Requirements](docs/functional-requirements.md)
* [Non Functional Requirements](docs/non-functional-requirements.md)
* [System Architecture](docs/system-architecture.md)
* [Microservices Design](docs/microservices-design.md)
* [Database Design](docs/database-design.md)
* [Event Flows](docs/event-flows.md)

---

# Project Structure

```
ecommerce-microservices-platform
│
├─ docs/
│   ├─ functional-requirements.md
│   ├─ non-functional-requirements.md
│   ├─ system-architecture.md
│   ├─ microservices-design.md
│   ├─ database-design.md
│   └─ event-flows.md
│
├─ services/
├─ frontend/
└─ infrastructure/
```
# This installs the CNPG Operator "Brain" directly into your cluster
kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.22/releases/cnpg-1.22.0.yaml

choco install kubernetes-helm -y
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install redis-session bitnami/redis --set sentinel.enabled=true --set global.redis.password="YourSecurePassword" --set replica.resources.limits.memory="512Mi" --set replica.resources.requests.memory="256Mi" --set replica.maxmemory="400mb"