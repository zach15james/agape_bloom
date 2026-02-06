#include <emscripten/emscripten.h>

extern "C" {
    EMSCRIPTEN_KEEPALIVE const char* get_manifesto() {
        return "Agape Bloom is a premier product laboratory, rooted in Louisiana and engineered to deliver asymmetric, dual-benefit solutions.\n\n"
               "Our process is driven by a relentless commitment to excellence and the service of Christ—leveraging lean principles to validate and execute on anormative insights.\n\n"
               "We are a collective of independent thinkers, united by radical openness and a tireless pursuit of value.";
    }
}