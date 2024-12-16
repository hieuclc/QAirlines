
<template>
    <div>
        <FlightCard
            v-for="flight in flights"
            :key="flight.id"
            :flightId="flight.id"
            :departureTime="flight.departureTime"
            :departureLocation="flight.departureLocation"
            :departureDate="flight.departureDate"
            :arrivalTime="flight.arrivalTime"
            :arrivalLocation="flight.arrivalLocation"
            :arrivalDate="flight.arrivalDate"
            :flightDuration="flight.flightDuration"
            :flightNumber="flight.flightNumber"
            :ticketType="flight.ticketType"
            :ticketPrice="flight.ticketPrice"
            :booking="flight.booking"
            @ticketSelected="handleTicketSelected"
        />
    </div>
</template>

<script>
import FlightCard from './FlightCard.vue';

export default {
    components: {
        FlightCard,
    },
    data() {
        return {
            flights: [
                // ...list of flight objects with unique ids...
            ],
        };
    },
    methods: {
        handleTicketSelected({ flightId, ticketType }) {
            console.log(`Flight ID: ${flightId}, Ticket Type: ${ticketType}`);
            // Process the selected flight card here
        },
    },
};
</script>