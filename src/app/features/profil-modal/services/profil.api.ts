import axios from 'axios';

export class profilApi {

    static becomeMoukhadam() {
        console.log("ap");

        return axios.get(`request-to-become/mouqadam`);
    }

    // static getDahira(dahiraId: string) {
    //     return axios.get(`dahiras/${dahiraId}`);
    // }

}