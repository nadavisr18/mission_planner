from backend.interface.interface import get_interface


# TODO: add kneeboards: https://forums.eagle.ru/topic/266375-fa-18c-kneeboard-suite-by-dimon/ | https://www.airgoons.com/w/Kneeboards
# TODO: modify radio presets
# TODO: randomize weather
# TODO: save waypoint plans
# TODO: create hashed temp file names
# TODO: clean temp files every X time
# TODO: add layers the user can load
# TODO: add restAPI


def main():
    i = get_interface()
    i.render()


if __name__ == '__main__':
    main()
