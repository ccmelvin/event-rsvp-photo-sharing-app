import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";
import { initSchema } from "@aws-amplify/datastore";

import { schema } from "./schema";

export enum RsvpStatus {
  ATTENDING = "ATTENDING",
  NOT_ATTENDING = "NOT_ATTENDING",
  MAYBE = "MAYBE"
}

type EagerEventModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Event, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly date: string;
  readonly location: string;
  readonly maxAttendees?: number | null;
  readonly isPublic?: boolean | null;
  readonly createdBy: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly rsvps?: (RSVPModel | null)[] | null;
  readonly photos?: (PhotoModel | null)[] | null;
}

type LazyEventModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Event, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly date: string;
  readonly location: string;
  readonly maxAttendees?: number | null;
  readonly isPublic?: boolean | null;
  readonly createdBy: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly rsvps: AsyncCollection<RSVPModel>;
  readonly photos: AsyncCollection<PhotoModel>;
}

export declare type EventModel = LazyLoading extends LazyLoadingDisabled ? EagerEventModel : LazyEventModel

export declare const EventModel: (new (init: ModelInit<EventModel>) => EventModel) & {
  copyOf(source: EventModel, mutator: (draft: MutableModel<EventModel>) => MutableModel<EventModel> | void): EventModel;
}

type EagerRSVPModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<RSVP, 'id'>;
  };
  readonly id: string;
  readonly eventId: string;
  readonly userId: string;
  readonly status?: RSVPStatus | keyof typeof RSVPStatus | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly event?: EventModel | null;
}

type LazyRSVPModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<RSVP, 'id'>;
  };
  readonly id: string;
  readonly eventId: string;
  readonly userId: string;
  readonly status?: RSVPStatus | keyof typeof RSVPStatus | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly event: AsyncItem<EventModel | undefined>;
}

export declare type RSVPModel = LazyLoading extends LazyLoadingDisabled ? EagerRSVPModel : LazyRSVPModel

export declare const RSVPModel: (new (init: ModelInit<RSVPModel>) => RSVPModel) & {
  copyOf(source: RSVPModel, mutator: (draft: MutableModel<RSVPModel>) => MutableModel<RSVPModel> | void): RSVPModel;
}

type EagerPhotoModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Photo, 'id'>;
  };
  readonly id: string;
  readonly eventId: string;
  readonly uploadedBy: string;
  readonly fileName: string;
  readonly fileSize?: number | null;
  readonly mimeType?: string | null;
  readonly s3Key: string;
  readonly thumbnailS3Key?: string | null;
  readonly caption?: string | null;
  readonly isApproved?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly event?: EventModel | null;
}

type LazyPhotoModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<Photo, 'id'>;
  };
  readonly id: string;
  readonly eventId: string;
  readonly uploadedBy: string;
  readonly fileName: string;
  readonly fileSize?: number | null;
  readonly mimeType?: string | null;
  readonly s3Key: string;
  readonly thumbnailS3Key?: string | null;
  readonly caption?: string | null;
  readonly isApproved?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly event: AsyncItem<EventModel | undefined>;
}

export declare type PhotoModel = LazyLoading extends LazyLoadingDisabled ? EagerPhotoModel : LazyPhotoModel

export declare const PhotoModel: (new (init: ModelInit<PhotoModel>) => PhotoModel) & {
  copyOf(source: PhotoModel, mutator: (draft: MutableModel<PhotoModel>) => MutableModel<PhotoModel> | void): PhotoModel;
}

type EagerUserProfileModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<UserProfile, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly email: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly isAdmin?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserProfileModel = {
  readonly [__modelMeta__]: {
    identifier: OptionallyManagedIdentifier<UserProfile, 'id'>;
  };
  readonly id: string;
  readonly userId: string;
  readonly email: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly isAdmin?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserProfileModel = LazyLoading extends LazyLoadingDisabled ? EagerUserProfileModel : LazyUserProfileModel

export declare const UserProfileModel: (new (init: ModelInit<UserProfileModel>) => UserProfileModel) & {
  copyOf(source: UserProfileModel, mutator: (draft: MutableModel<UserProfileModel>) => MutableModel<UserProfileModel> | void): UserProfileModel;
}



const { Event, RSVP, Photo, UserProfile } = initSchema(schema) as {
  Event: PersistentModelConstructor<EventModel>;
  RSVP: PersistentModelConstructor<RSVPModel>;
  Photo: PersistentModelConstructor<PhotoModel>;
  UserProfile: PersistentModelConstructor<UserProfileModel>;
};

export {
  Event,
  RSVP,
  Photo,
  UserProfile
};