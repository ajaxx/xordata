# Description

This is my own personal journey through intelligent ways to identify and exchange information... usually personal using electronic means.

# Background

Many years ago, I was entering going to a clinic for a medical procedure.  It was something routine, but when I arrived, the person at the counter asked me to fill out 5 pages of history about my health.  I remembered thinking to myself, there must be an easier way for me to exchange this information with others.  Of course, the problem is that in many cases, the health care provider owns your data.  They own the history of your data.  And it's up to you to unlock what is in your history by using a combination of phone calls, inquiries, and whats in your head.

Today, I think some products are answering these questions.  For example, Apple health begins to answer some of this.  But for most, the problem is that HIPAA restricts what information a company can share about you.  But more importantly, it's honestly not in there best interest to share it.

But what if you owned your data?  What if you decided what you wanted to share?  And what if you could use the myriad of digital devices you already own to facilitate that communication.

# Questions and considerations

## How would you prove your identity?

Maybe that it done independent of the information exchange, but maybe it is a solution we can provide (e.g., KYC).

## Where would we keep this information?

Preferably, we'd like to find a way to keep this on your devices.  But we live in an era when people keep their information in the cloud.  So, is it possible that we could keep the data securely managed in the cloud (what does that even mean), but provide a way to connect to and downlaod that information?

## How would we keep it secure?

At a bare minimum, this information needs to be encrypted, end to end.  Meaning, the information is encrypted at rest and encrypted in transit.  The information (as seen from this product) should never be plain text visible.  There are some nuances ... for instance, if you're providing a debug window to view the data, you might need to consider how you will do that.  But I think decryption can still be done without exposing any data except at the endpoints.

The application MUST have an identity system preferably facilitaed by an identity provider (who is not us).  And if we are ever exchanging information with a third party, we need the notion of authentication.

# Design

## Data exchange in the cloud?

That could be interesting... party A asks for access to data from party B.  Party A exchanges a public key... Party B takes their data, decrypts with their symmetric key.  Party B encrypts with a symmetric key + asymmetric key (standard PK encryption using the party A public key).

