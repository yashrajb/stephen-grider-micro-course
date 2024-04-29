- users can lst a ticket an event for sale

- other users can purchase this ticket

- any user can list tickets for sale and purchase tickets

- when a user attempts to purchase a ticket, the ticket is "locked" for 15 minutes. The user has 15 minutes (we can make it less) to enter their payment info

- while locked, no other user can purchase the ticket. After 15 minutes, the ticket should "unlock"

-Ticket prices can be edited if ther are not locked

## Authentication Strategies

    - User auth with microservices is an unsolved problem
    -There are many ways to do it and no one way is right
    - going to outline a couple solutions then propose a solution that works but still have downsides

    There are 2 options
     - put auth service between client request and every pod service
        - problem with this strategy is if auth service goes down then other service will not going to work
     - embedding logic of JWT in every service or pod
        - problem is if some user got banned. we will trust user request for short time of period because we received notification user ban late

- We are going with option 2 to stick with the idea of independent services. we can also create hybrid architecture

- 1 viable solution for 2 option is using refresh token logic and setting jwt cookies for shorter time. if don't want short time period. then you need to use some event bus with memory cached database. soon as user will banned, auth service will emit event and then store in db or memory cached db in other pods. we will need this for short time. after, when user try to make request it will automatically going to ban

## Cookies and JWT

### Cookies

A cookie with the Secure attribute is only sent to the server with an encrypted request over the HTTPS protocol.

kind of transport mechanism

So we're going to imagine that we've got some browser.Making a request over to some server. When the server sends a response back over to the browser, it can optionally include a header of set cookie and then for that set cookie header, it can provide some kind of value.

This value right here can be a string that contains any information that we want. That little piece of information is then going to be automatically stored inside of the browser. Then whenever this browser makes a follow up request to the same domain with the same port, the browser is going to make sure that it takes that little piece of information right there and appends it onto the request as a cookie header. So there's that little piece of information right there. It will be automatically sent over to the server.

The key things to understand here around this cookie approach or this idea of saving some cookie is that it's some arbitrary piece of information.

Doesn't really matter what this information is. It can be anything we possibly can think of. That piece of information will be automatically stored by the browser and automatically sent to the server any time we make a follow up request. Those are the key things to remember about cookies in general.

### JWTs

- authentication/authorization mechanism
- stores any data we want
- we have to manage it manually

- we can use store JWT in cookie and use the hybrid mechanism for auhentication

## To create env variable and pass it in every pod
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
secret/jwt-secret created

## namespaces in kubernets enviroment and cross namespace communication uses a different pattern
 - namespace is something that exists in the world of kubernetes. all the different objects we create are created under specific namespace.You can think of a namespace as being like a sandbox of sorts.We use namespaces for organizing different objects.Right now, we've been working under a namespace called default.

 - run `kubectl get namespace`

 - there is another namespace of ingress-nginx. we can't reach directly to this namespace. to reach out that namespace you need to use complicated url or domain

 - run command `kubectl get services -n ingress-ngnix` to get controller which routes apis

 - for example to reach out to ingress-nginx namespace from default namespace. you should write 
 http://ingress-nginx.ingress-nginx-controller.svc.cluster.local

## using npm for code sharing and organization
- we will going to use npm for code sharing. we will publish npm package of repeatable code or you can say common code. so, we can use easily in any other package

**npm security**
- there are 2 registry in npm which is npm public registry and private registry. if you are using some sensitive information in your code then push it in private registry otherwise you should use public registry. putting code in public registry anybody can see code.
- we will create public one not private one
- we will write code in javascript not in typescript. so, we not encounter any typescript version issues

## NATS
- we going to use NATs streaming server
- NATS and NATs streaming server are two different thins
- port forwading without nodeport and clusterIP (strictly for local development purpose) - kubectl port-forward nats-depl-6498759cdd-vs5zt 4222:4222
- whenever you create listner or publisher. nats streaming server maintain list of the client. if try to connect with nats with same client id then it will return error. to resolve from this problem. we used randomBytes in code. so, it will generate new id everytime whenever we new publisher or consumer
- a queue group is created to make sure that multiple instances of the same service are not all going to receive the exact same event.
- setManualAckMode - Ack is short for acknowledgement mode to true. if anything goes incorrectly inside of our message handlerright here, then that's it. We're never going to hear about this event again. By setting manual mode to true.The No Nat streaming library is no longer going to automatically acknowledge or tell the Nat streaming library that we have received the event. And instead it will be up to you and I to run some processing on that event, possibly save some information to the database, and then after that entire process is complete. Only after will we then acknowledge the message and say, okay, everything has been processed successfully. If we do not acknowledge the incoming event, then the Netstrom server is going to wait some amount of time. I believe it's 30 seconds by default. And then after 30 seconds of not getting an acknowledgement, it's going to automatically decide to take that event and send it on to some other member of that group. Or possibly if there's if we're not a part of a group, just send it back to the same service again
and allow it to give it to have another shot at processing this thing.

### Core concurrency 
- Title: Handling Asynchronous Communication in Microservices - Part 1

Introduction:
- Asynchronous communication between microservices is complex but crucial.
- Focus on graceful shutdown and event handling in a banking application scenario.

Scenario Overview:
- Banking application with a publisher emitting account deposit and withdraw events.
- Two services, Account Service A and Account Service B, members of the same Q group for event handling.

Ideal Event Flow:
1. Publisher emits a deposit event of $70, goes to Account Service A.
2. Publisher emits another deposit event of $40, goes to Account Service B.
3. Publisher emits a withdraw event of $100, goes to Account Service A or B.

Potential Failure Scenarios:

1. Listener Fails to Process Event:
   - Account Service fails to process an incoming event due to file locking, faulty logic, or other issues.
   - If event processing fails, the event is not acknowledged, leading to reprocessing after 30 seconds.
   - During this waiting period, subsequent events can cause critical errors if not handled properly.

2. Listener Processing Speed:
   - If one service processes events slower due to backlog or other reasons, it can cause issues.
   - Events might be sent to another service before the first one processes them, leading to incorrect state changes.

3. Client Shutdown Delay:
   - A service might shut down abruptly, but the streaming server doesn't detect it immediately.
   - Events might be sent to a dead service, causing delays in event processing and potential errors.

4. Timing and Order of Events:
   - Events occurring in rapid succession or with long intervals can lead to unexpected behaviors.
   - Timing issues, like delayed file access, can result in processing events out of order and causing errors.

- Ideal Event Flow:

     Publisher        Streaming Server        Account Service A      Account Service B
   +------------+      +----------------+      +----------------+      +----------------+
   |             |----->|                |----->|                |      |                |
   | Deposit $70 |      |                |      |   Open File    |      |                |
   |             |      |                |      |   Update $70   |      |                |
   +------------+      |                |      +----------------+      +----------------+
                       +----------------+      


Conclusion:
- Asynchronous communication in microservices presents numerous challenges.
- These challenges include event processing failures, timing issues, and graceful shutdown handling.
- These issues are not unique to any specific event bus implementation but are inherent in asynchronous architectures.
- Strategies are needed to address these challenges effectively.



