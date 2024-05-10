import { apiSlice } from "./apiSlice";
import { DEVICE_URL, USER_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}`,
        method: "POST",
        body: data,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Accept: "application/json",
        },
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: `/profile`,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Accept: "application/json",
        },
      }),
      providesTags: ["Device"],
      keepUnusedDataFor: 5,
    }),
    getDevices: builder.query({
      query: () => ({
        url: DEVICE_URL,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Accept: "application/json",
        },
      }),
      providesTags: ["Device"],
      keepUnusedDataFor: 5,
    }),
    deleteDevice: builder.mutation({
      query: (id) => ({
        url: `${DEVICE_URL}/${id}`,
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Accept: "application/json",
        },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDevicesQuery,
  useDeleteDeviceMutation,
  useGetProfileQuery,
} = userApiSlice;
